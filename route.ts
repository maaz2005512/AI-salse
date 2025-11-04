import { NextRequest } from 'next/server';
import { Deepgram } from '@deepgram/sdk';

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  const dg = new Deepgram(process.env.DEEPGRAM_API_KEY || '');
  const { readable, writable } = new TransformStream();

  // Not a real WebSocket handler, just placeholder for Vercel Edge restrictions
  // For local use, replace with ws server using ws or socket.io

  return new Response(readable, {
    headers: { 'Content-Type': 'application/json' },
  });
}