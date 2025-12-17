import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./Config/DB/connectDB";
import { authrouter } from "./Routes/Auth/auth.routes";
import { fileuploadrouter } from "./Routes/FilesUpload/fileupload.routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
connectDB()

app.use(express.json());
app.use("/api/v1/auth", authrouter)
app.use("/api/v1/file", fileuploadrouter)

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error handler:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    source: err.source || "Unknown",
  });
});


app.listen(PORT, () => {
  console.log(`✔️ ----------------> Server running on port ${PORT}`);
});
