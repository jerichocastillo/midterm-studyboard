export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Access forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}