import { model, Schema, Types } from "mongoose";

export type FileRole = "owner" | "viewer";

export interface IFilePermission {
  _id: Types.ObjectId;
  fileId: Types.ObjectId;
  userId: Types.ObjectId;
  role: FileRole;
  expiresAt?: Date;
  createdAt: Date;
}

const FilePermissionSchema = new Schema<IFilePermission>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "viewer"], required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

FilePermissionSchema.index({ fileId: 1, userId: 1 }, { unique: true });

export const FilePermissionModel = model<IFilePermission>(
  "FilePermission",
  FilePermissionSchema
);
