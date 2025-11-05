import { NextResponse } from "next/server";
import { Deepgram } from "@deepgram/sdk";

export async function GET() {
  const dg = new Deepgram(process.env.DEEPGRAM_API_KEY || "");

  try {
    const { client_secret } = await dg.keys.createProjectKey({
      comment: "temporary-session",
      scopes: ["usage:write"],
      time_to_live_in_seconds: 600, // valid for 10 mins
    });

    return NextResponse.json({ key: client_secret });
  } catch (error: any) {
    console.error("Token error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
