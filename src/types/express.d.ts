import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      files?: Multer.File[];
      file?: Multer.File;
      user?: {
        userId: string;
        email?: string;
      };
    }
  }
}

export {};
