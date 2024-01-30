import delegateToWorker from "@/utils/delegateToWorker";
import { NextRequest, NextResponse } from "next/server";
import { openPickleJar } from "../openPickleJar";

export async function POST(request: NextRequest) {
  const { width, height } = await request.json();
  const path = request.nextUrl.pathname;
  const body = await delegateToWorker(path, openPickleJar, { width, height });
  return NextResponse.json(body);
}