import axios from "axios";
import { z } from "zod";

export class AIFeatureUnavailableError extends Error {
  constructor() {
    super("AI_BASE_URL or AI_MODEL are not yet configured");
    this.name = "AIFeatureUnavailableError";
  }
}

export class AIRequestError extends Error {
  constructor() {
    super("The AI model did not return a usable response");
    this.name = "AIRequestError";
  }
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionRequest = {
  choices?: { message: { content?: string | null } }[];
};

function getSettings(): { baseUrl: string; model: string; apiKey?: string } {
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;

  if (!baseUrl || !model) {
    throw new AIFeatureUnavailableError();
  }

  return {
    baseUrl,
    model,
    apiKey: process.env.AI_API_KEY || undefined,
  };
}

async function chat(messages: ChatMessage[]): Promise<string> {
  const { baseUrl, model, apiKey } = getSettings();

  const { data } = await axios.post<ChatCompletionRequest>(
    `${baseUrl.replace(/\/+$/, "")}/chat/completions`,
    { model, messages, temperature: 0.3 },
    {
      timeout: 20_000,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    }
  );

  return data.choices?.[0]?.message?.content ?? "";
}

const SubTaskSuggestions = z.object({
  subtasks: z.array(z.string().trim().min(1)).min(3).max(6),
});

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new AIRequestError();
  }

  return JSON.parse(text.slice(start, end + 1));
}

function parseSubtask(text: string): string[] {
  return SubTaskSuggestions.parse(extractJson(text)).subtasks.slice(0, 6);
}

export async function generateSubtaskSuggestions(topic: string, groupSubject: string): Promise<string[]> {
  getSettings();

  const prompt: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful study assistant for a student study-group app. " +
        "Given a broad task or topic, break it into 3 to 6 concise, " +
        "concrete, actionable subtasks a study group could each check " +
        "off individually. Keep each subtask under 12 words. Do not " +
        'include numbering. Reply with ONLY a JSON object like {"subtasks": ' +
        '["first subtask", "second subtask"]} and nothing else.',
    },
    {
      role: "user",
      content: `Study group subject: ${groupSubject}\n\nTask to breakdown: ${topic}`,
    },
  ];

  for (let attempt = 1; attempt <= 2; attempt++) {
    const text = await chat(prompt);

    try {
      return parseSubtask(text);
    } catch {
      prompt.push(
        { role: "assistant", content: text },
        {
          role: "user",
          content:
            "The response was not valid JSON. Reply with ONLY a JSON object of the form {\"subtasks\": [\"first subtask\", \"second subtask\"]}.",
        }
      );
    }
  }

  throw new AIRequestError();
}
