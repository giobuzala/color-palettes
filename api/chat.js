/**
 * Serverless proxy for OpenAI chat. Keeps OPENAI_API_KEY on the server.
 * Used when deployed (e.g. Vercel). For local dev, use server.js.
 *
 * Request body:
 * { messages: [{ role, content }, ...], systemPrompt: string }
 *
 * Response body:
 * { content: string } or { error: string }
 */
export default {
    async fetch(request) {
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const key = process.env.OPENAI_API_KEY;
        if (!key || !key.trim()) {
            return new Response(
                JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { messages, systemPrompt } = body || {};
        if (!Array.isArray(messages) || !systemPrompt) {
            return new Response(
                JSON.stringify({ error: 'Body must include messages (array) and systemPrompt (string).' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const payload = {
            model: 'gpt-4o',
            temperature: 0.3,
            top_p: 1,
            presence_penalty: 0,
            frequency_penalty: 0,
            max_tokens: 600,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.filter(m => m.role === 'user' || m.role === 'assistant')
            ]
        };

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${key.trim()}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                return new Response(
                    JSON.stringify({ error: data?.error?.message || `OpenAI error (${res.status})` }),
                    { status: res.status, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const content =
                data?.choices?.[0]?.message?.content ?? 'I could not generate a response.';
            return new Response(JSON.stringify({ content }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(
                JSON.stringify({ error: e?.message || 'Request failed.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }
};
