import HighScore from "@/models/highScoreSchema";
import dbConnect from "@/utils/connectDB";


export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const highScore = await HighScore.create(body);
        console.log(body)
        return new Response({ success: true, data: highScore }, { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500 });
    }
}

export async function GET() {
    await dbConnect();
    try {
        const highScores = await HighScore.find().sort({ score: -1 }).limit(100);

    return new Response(JSON.stringify(highScores), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500 });
    }


}