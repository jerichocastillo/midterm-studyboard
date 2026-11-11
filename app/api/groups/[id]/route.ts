import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as groupServices from "@/lib/services/groupService";
import { updateGroupSchema } from "@/lib/validations";
import { ForbiddenError, NotFoundError } from "@/lib/errors";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const group = await groupServices.getGroupById(params.id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session){
    return NextResponse.json(
      {error: "Unauthorized"},
      {status: 401}
    );
  }

  const body = await request.json();
  const parsedResponse = updateGroupSchema.safeParse(body);
  if ( !parsedResponse.success){
    return NextResponse.json(
      { error: parsedResponse.error.issues[0].message},
      { status: 400 }
    )
  }

  try {
    const updated = await groupServices.updateGroup(
    params.id,
    session.user.id,
    parsedResponse.data
  );
  return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({error: error.message}, {status: 404});
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({error: error.message}, {status: 403});
    }  
    throw error;
  } 
}
  
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session){
    return NextResponse.json(
      {error: "Unauthorized"},
      {status: 401}
    );
  }

  try {
    await groupServices.deleteGroup(
      params.id,
      session.user.id
    );
    return NextResponse.json({message: "Group deleted"});
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({error: error.message}, {status: 404});
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({error: error.message}, {status: 403});
    }
    throw error;
  }
}