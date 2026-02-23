<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    const OPENAI_API_KEY = __OPENAI_API_KEY__;

    let isOpen = false;
    let message = '';
    let loading = false;
    let error = '';

    let messages = [
        {
            role: 'assistant',
            content:
                'Tell me the palette you want, for example: "Create a calm diverging palette with 5 colors."'
        }
    ];

    function buildSystemPrompt() {
        return `You are a color palette assistant for a chroma.js palette tool.
Your job is to convert user requests into palette settings.

Return only a JSON object with this exact shape:
{
  "mode": "sequential" | "diverging",
  "numColors": number,
  "colors": ["#RRGGBB", ...],
  "colors2": ["#RRGGBB", ...],
  "bezier": boolean,
  "correctLightness": boolean
}

Rules:
- numColors must be >= 2
- mode must be either "sequential" or "diverging"
- For sequential mode: colors2 should be []
- For diverging mode: provide both colors and colors2 with at least 2 color stops each
- Prefer valid 6-digit hex values in colors and colors2
- Do not add markdown, code fences, or explanation text`;
    }

    function describeAppliedConfig(config) {
        const modeLabel = config.mode === 'diverging' ? 'diverging' : 'sequential';
        const count = Math.max(2, Math.round(+config.numColors || 0));
        const bezierLabel = config.bezier ? 'on' : 'off';
        const lightnessLabel = config.correctLightness ? 'on' : 'off';
        return `Applied ${modeLabel} palette with ${count} colors (bezier ${bezierLabel}, lightness correction ${lightnessLabel}).`;
    }

    function extractPaletteConfig(text) {
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (codeBlockMatch && codeBlockMatch[1]) {
            try {
                return JSON.parse(codeBlockMatch[1].trim());
            } catch (e) {
                // Fall through to looser parsing.
            }
        }

        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(text.substring(start, end + 1));
            } catch (e) {
                return null;
            }
        }

        return null;
    }

    async function sendMessage() {
        const prompt = message.trim();
        if (!prompt || loading) return;

        error = '';
        messages = [...messages, { role: 'user', content: prompt }];
        message = '';

        if (!OPENAI_API_KEY.trim()) {
            error = 'Missing OPENAI_API_KEY in your .env file.';
            return;
        }

        loading = true;
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY.trim()}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    temperature: 0.5,
                    messages: [
                        { role: 'system', content: buildSystemPrompt() },
                        ...messages
                            .filter(m => m.role === 'user' || m.role === 'assistant')
                            .map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(`OpenAI error (${response.status}): ${msg}`);
            }

            const data = await response.json();
            const content =
                data &&
                data.choices &&
                data.choices[0] &&
                data.choices[0].message &&
                data.choices[0].message.content
                    ? data.choices[0].message.content
                    : 'I could not generate a response.';

            const parsed = extractPaletteConfig(content);
            if (parsed) {
                dispatch('applyPalette', parsed);
                messages = [...messages, { role: 'assistant', content: describeAppliedConfig(parsed) }];
            } else {
                messages = [...messages, { role: 'assistant', content }];
                error = 'I could not parse palette JSON from the response.';
            }
        } catch (e) {
            error = e && e.message ? e.message : 'Request failed.';
        } finally {
            loading = false;
        }
    }

    function onMessageKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
</script>

<button class="chat-toggle btn btn-primary" on:click={() => (isOpen = !isOpen)}>
    {isOpen ? 'Close AI' : 'Ask AI'}
</button>

{#if isOpen}
    <div class="chat-panel card">
        <div class="chat-header card-header">
            <strong>Palette Assistant</strong>
        </div>

        <div class="chat-messages">
            {#each messages as msg}
                <div class="bubble {msg.role}">
                    <div class="role">{msg.role === 'user' ? 'You' : 'AI'}</div>
                    <div class="content">{msg.content}</div>
                </div>
            {/each}
        </div>

        {#if error}
            <div class="chat-error">{error}</div>
        {/if}

        <div class="chat-input">
            <textarea
                class="form-control"
                rows="2"
                bind:value={message}
                placeholder='Try: "calm diverging palette with 5 colors"'
                on:keydown={onMessageKeydown} />
            <button class="btn btn-primary" disabled={loading} on:click={sendMessage}>
                {loading ? 'Sending...' : 'Send'}
            </button>
        </div>
    </div>
{/if}

<style>
    .chat-toggle {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 1000;
    }

    .chat-panel {
        position: fixed;
        right: 20px;
        bottom: 70px;
        width: 360px;
        max-width: calc(100vw - 32px);
        height: 540px;
        max-height: calc(100vh - 100px);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .chat-messages {
        flex: 1;
        overflow: auto;
        padding: 12px;
        background: #fafafa;
    }

    .bubble {
        margin-bottom: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: #f0f0f0;
    }

    .bubble.user {
        background: #d9ecff;
    }

    .bubble.assistant {
        background: #f3f3f3;
    }

    .role {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
    }

    .content {
        white-space: pre-wrap;
        font-size: 13px;
        line-height: 1.4;
    }

    .chat-error {
        color: #b00020;
        font-size: 13px;
        padding: 8px 12px 0;
    }

    .chat-input {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #e5e5e5;
    }
</style>
