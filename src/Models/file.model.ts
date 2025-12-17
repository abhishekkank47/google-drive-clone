import { Schema, model, Types } from "mongoose";

export interface IFile {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  filename: string;
  mimeType: string;
  size: number;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  createdAt: Date;
}


const FileSchema = new Schema<IFile>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export const FileModel = model<IFile>("File", FileSchema);
