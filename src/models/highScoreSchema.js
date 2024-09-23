import mongoose from "mongoose";

const highScoreSchema = new mongoose.Schema({
    nickname: String,
    score: Number,
    goldTiles: Number,
    date: { type: Date, default: Date.now }
  });

  const HighScore = mongoose.models.HighScore || mongoose.model("HighScore", highScoreSchema);
  export default HighScore