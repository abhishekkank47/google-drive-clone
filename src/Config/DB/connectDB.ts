import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {});

    console.log(`🍃 ----------------> MongoDB Connected: ${conn.connection.host} ✔️`);
  } catch (error) {
    console.error(`❌ MongoDB connection error:`, error);
    process.exit(1); 
  }
};