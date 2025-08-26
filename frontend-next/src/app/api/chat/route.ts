import { StreamingTextResponse, Message } from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

async function createNewSession(): Promise<string> {
  const response = await fetch(`${BACKEND_API_URL}/sessions`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  const session = await response.json();
  return session.data.session_id;
}

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  let { sessionId, eventId, attachments } = data || {};

  try {
    // If no session ID is provided, create a new one
    if (!sessionId) {
      sessionId = await createNewSession();
    }

    // Proxy the request to the Python backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messages[messages.length - 1].content,
        event_id: eventId,
        attachments
      }),
    });

    // Check if the backend response is valid
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} ${errorText}`);
      return new Response(JSON.stringify({ error: 'Backend service failed', details: errorText }), {
        status: backendResponse.status,
      });
    }

    // The response from the backend is already a text/event-stream,
    // so we can pipe it directly to the client.
    // We also need to send back the `sessionId` so the client can continue the conversation.
    // The Vercel AI SDK reads custom headers from 'X-Experimental-Stream-Data'.
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('X-Experimental-Stream-Data', JSON.stringify({ sessionId }));

    return new Response(backendResponse.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error in chat proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
