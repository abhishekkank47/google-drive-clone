// src/routes/file.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../Middlewares/authtoken.middleware";
import upload from "../../Middlewares/multer.middleware";
import { accessFileViaShareLink, createShareLink, getFilesSharedWithMe, getMyFiles, shareFileWithUsers, uploadFiles } from "../../Controllers/FilesUpload/fileupload.controller";

export const fileuploadrouter = Router();

fileuploadrouter.post(
  "/upload",
  authMiddleware,
  upload.array("files", 10),
  uploadFiles
);

fileuploadrouter.get("/my-uploads", authMiddleware, getMyFiles);
fileuploadrouter.post("/:fileId/share/users", authMiddleware, shareFileWithUsers)
fileuploadrouter.get("/shared-with-me", authMiddleware, getFilesSharedWithMe)
fileuploadrouter.post("/:fileId/share/link", authMiddleware, createShareLink)
fileuploadrouter.get("/share/:token", authMiddleware, accessFileViaShareLink);
