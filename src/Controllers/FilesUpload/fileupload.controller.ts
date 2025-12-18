import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { FileModel } from "../../Models/file.model";
import { FilePermissionModel } from "../../Models/filepermission.model";
import { FileAuditModel } from "../../Models/fileaudit.model";
import userModel from "../../Models/user.model";
import { ShareLinkModel } from "../../Models/sharelink.model";
import { createHash, randomUUID } from "node:crypto";
// import cloudinary from "../../Config/Cloudinary/cloudinary.config";

//-------------------------------------------------------------------------- Upload
export const uploadFiles = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedFiles = [];

    for (const file of files) {
      const newFile = await FileModel.create(
        [
          {
            ownerId: user.userId,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            cloudinaryPublicId: file.filename,
            cloudinaryUrl: file.path,
          },
        ],
        { session }
      );

      const fileId = newFile[0]._id;

      // OWNER permission
      await FilePermissionModel.create(
        [
          {
            fileId,
            userId: user.userId,
            role: "owner",
          },
        ],
        { session }
      );

      // Audit log
      await FileAuditModel.create(
        [
          {
            fileId,
            userId: user.userId,
            action: "UPLOAD",
          },
        ],
        { session }
      );

      savedFiles.push(newFile[0]);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Files uploaded successfully",
      files: savedFiles,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Upload error:", error);
    return res.status(500).json({
      message: "File upload failed",
    });
  }
};
//-------------------------------------------------------------------------- Upload

//-------------------------------------------------------------------------- My files
export const getMyFiles = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const files = await FileModel.find({ ownerId: user.userId })
      .select("filename mimeType size createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      files: files.map((file) => ({
        id: file._id,
        filename: file.filename,
        type: file.mimeType,
        size: file.size,
        uploadedAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get my files error:", error);
    return res.status(500).json({
      message: "Failed to fetch files",
    });
  }
};
//-------------------------------------------------------------------------- My files

//-------------------------------------------------------------------------- Share File With Specific Users
export const shareFileWithUsers = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fileId } = req.params;
  const { userIds, expiresAt } = req.body;

  if (!user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid fileId" });
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .json({ message: "userIds must be a non-empty array" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify file exists & requester is OWNER
    const file = await FileModel.findOne({
      _id: fileId,
      ownerId: user.userId,
    }).session(session);

    if (!file) {
      return res.status(403).json({
        message: "You are not the owner of this file",
      });
    }

    // Validate users exist (and remove duplicates)
    const uniqueUserIds = [...new Set(userIds)];

    const validUsers = await userModel
      .find({
        _id: { $in: uniqueUserIds },
      })
      .select("_id")
      .session(session);

    if (validUsers.length !== uniqueUserIds.length) {
      return res.status(400).json({
        message: "One or more userIds are invalid",
      });
    }

    // Upsert permissions
    const bulkOps = uniqueUserIds.map((uid) => ({
      updateOne: {
        filter: {
          fileId,
          userId: uid,
        },
        update: {
          $set: {
            role: "viewer",
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          },
        },
        upsert: true,
      },
    }));

    await FilePermissionModel.bulkWrite(bulkOps, { session });

    // Audit log
    await FileAuditModel.create(
      [
        {
          fileId,
          userId: user.userId,
          action: "SHARE_USER",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "File shared successfully",
      sharedWith: uniqueUserIds.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Share file error:", error);
    return res.status(500).json({
      message: "Failed to share file",
    });
  }
};
//-------------------------------------------------------------------------- Share File With Specific Users

//----------------------------------------------------------------------------- get Files Shared With Me
export const getFilesSharedWithMe = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = new Date();

  const permissions = await FilePermissionModel.find({
    userId: new mongoose.Types.ObjectId(user.userId),
    role: "viewer",
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  }).select("fileId");

  if (permissions.length === 0) {
    return res.status(200).json({ files: [] });
  }

  const fileIds = permissions.map((p) => p.fileId);

  const files = await FileModel.find({
    _id: { $in: fileIds },
  })
    .select("filename mimeType size createdAt ownerId")
    .populate("ownerId", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    files,
  });
};
//----------------------------------------------------------------------------- get Files Shared With Me

//----------------------------------------------------------------------------- share link to users
export const createShareLink = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fileId } = req.params;
  const { expiresAt } = req.body;

  if (!user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid fileId" });
  }

  const isOwner = await FilePermissionModel.findOne({
    fileId: new Types.ObjectId(fileId),
    userId: new Types.ObjectId(user.userId),
    role: "owner",
  });

  if (!isOwner) {
    return res
      .status(403)
      .json({ message: "Only owner can create share link" });
  }

  const file = await FileModel.findById(fileId);
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const rawToken = randomUUID();

  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  // Store hashed token
  await ShareLinkModel.create({
    fileId,
    tokenHash,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    createdBy: user.userId,
  });

  // Audit log
  await FileAuditModel.create({
    fileId,
    userId: user.userId,
    action: "SHARE_LINK",
  });

  // Return share URL
  const shareUrl = `${process.env.APP_BASE_URL}/share/${rawToken}`;

  return res.status(201).json({
    shareUrl,
  });
};
//----------------------------------------------------------------------------- share link to users

//------------------------------------------------------------------------------- access File Via ShareLink
export const accessFileViaShareLink = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { token } = req.params;

  // Auth required (NO public access)
  if (!user?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!token) {
    return res.status(400).json({ message: "Missing share token" });
  }

  // Hash incoming token (NEVER compare raw)
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Validate share link
  const shareLink = await ShareLinkModel.findOne({
    tokenHash,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });

  if (!shareLink) {
    return res.status(404).json({ message: "Invalid or expired share link" });
  }

  // Fetch file metadata ONLY
  const file = await FileModel.findById(shareLink.fileId).select(
    "filename mimeType size createdAt ownerId"
  );

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  // Return metadata (NOT Cloudinary URL)
  return res.status(200).json({
    file: {
      id: file._id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.createdAt,
      ownerId: file.ownerId,
    },
  });
};
//------------------------------------------------------------------------------- access File Via ShareLink

//-------------------------------------------------------------------------- download File
export const downloadFile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fileId } = req.params;

  if (!user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid fileId" });
  }

  /**
   * 1️⃣ Fetch file
   */
  const file = await FileModel.findById(fileId);
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  /**
   * 2️⃣ Check access via FilePermission
   */
  const permission = await FilePermissionModel.findOne({
    fileId,
    userId: user.userId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });

  if (!permission) {
    return res.status(403).json({ message: "Access denied" });
  }

  /**
   * 3️⃣ Audit log (DOWNLOAD)
   */
  await FileAuditModel.create({
    fileId,
    userId: user.userId,
    action: "DOWNLOAD",
  });

  /**
   * 4️⃣ Return Cloudinary URL (TEMPORARY)
   * ⚠️ Later replace with signed URL or streaming
   */
  return res.status(200).json({
    file: {
      id: file._id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      url: file.cloudinaryUrl, // exposed for now
    },
  });
};
//-------------------------------------------------------------------------- download File
