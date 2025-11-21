import { NextResponse } from "next/server";
import { sampleNote } from "@/data/sampleNote";

export async function GET() {
  return NextResponse.json(sampleNote);
}

