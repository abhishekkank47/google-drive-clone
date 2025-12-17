import { model, Schema, Types } from "mongoose";

export type FileAction = "UPLOAD" | "SHARE_USER" | "SHARE_LINK" | "DOWNLOAD";

export interface IFileAudit {
  _id: Types.ObjectId;
  fileId: Types.ObjectId;
  userId: Types.ObjectId;
  action: FileAction;
  createdAt: Date;
}

const FileAuditSchema = new Schema<IFileAudit>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["UPLOAD", "SHARE_USER", "SHARE_LINK", "DOWNLOAD"],
      required: true,
    },
  },
  { timestamps: true }
);

export const FileAuditModel = model<IFileAudit>(
  "FileAudit",
  FileAuditSchema
);
