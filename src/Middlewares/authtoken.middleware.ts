import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { NotAuthourisedError } from "../Helper/error-handler";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new NotAuthourisedError("Authorization header missing or malformed", "AuthMiddleware"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new NotAuthourisedError("No token provided", "AuthMiddleware"));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("FATAL: JWT_SECRET is not defined in environment variables.");
    return next(new Error("Internal server error")); 
  }

  try {
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return next(new NotAuthourisedError("Invalid or expired token", "AuthMiddleware"));
  }
};
