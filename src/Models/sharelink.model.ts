import { model, Schema, Types } from "mongoose";

export interface IShareLink {
  _id: Types.ObjectId;
  fileId: Types.ObjectId;
  tokenHash: string;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const ShareLinkSchema = new Schema<IShareLink>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ShareLinkModel = model<IShareLink>("ShareLink", ShareLinkSchema);
