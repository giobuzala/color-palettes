<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Note: this key is bundled into the client build via Rollup `replace`.
    // This is fine for local experiments, but do NOT ship a real API key to production.
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

<button class="chat-toggle" on:click={() => (isOpen = !isOpen)} title="AI palette assistant">
    <svg
        class="chat-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span class="chat-label">{isOpen ? 'Close' : 'Ask AI'}</span>
</button>

{#if isOpen}
    <div class="chat-panel">
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
                rows="2"
                bind:value={message}
                placeholder='Try: "Calm diverging palette with 5 colors"'
                on:keydown={onMessageKeydown} />
            <button class="send-btn" disabled={loading} on:click={sendMessage}>
                {loading ? '...' : 'Send'}
            </button>
        </div>
    </div>
{/if}

<style>
    .chat-toggle {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 1000;
        padding: 0 16px 0 12px;
        height: 48px;
        border-radius: 999px;
        border: none;
        background: #4b6cb7;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(75, 108, 183, 0.4);
        font-size: 0.95rem;
        font-weight: 600;
        font-family: inherit;
    }
    .chat-toggle:hover {
        background: #3d5a9e;
    }
    .chat-toggle .chat-icon {
        flex-shrink: 0;
    }
    .chat-toggle .chat-label {
        white-space: nowrap;
    }

    .chat-panel {
        position: fixed;
        right: 24px;
        bottom: 84px;
        width: 340px;
        max-width: calc(100vw - 32px);
        height: 480px;
        max-height: calc(100vh - 110px);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.85);
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        overflow: hidden;
    }

    .chat-messages {
        flex: 1;
        overflow: auto;
        padding: 16px;
    }

    .bubble {
        margin-bottom: 10px;
        padding: 10px 12px;
        border-radius: 12px;
    }

    .bubble.user {
        background: rgba(75, 108, 183, 0.1);
    }

    .bubble.assistant {
        background: rgba(0, 0, 0, 0.03);
    }

    .role {
        font-size: 11px;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 3px;
    }

    .content {
        white-space: pre-wrap;
        font-size: 13px;
        line-height: 1.45;
        color: #374151;
    }

    .chat-error {
        color: #dc2626;
        font-size: 12px;
        padding: 0 16px 4px;
    }

    .chat-input {
        display: flex;
        align-items: stretch;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .chat-input textarea {
        flex: 1;
        resize: none;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 13px;
        font-family: inherit;
        line-height: 1.4;
        background: #fff;
        margin: 0;
    }
    .chat-input textarea:focus {
        outline: none;
        border-color: #4b6cb7;
    }

    .send-btn {
        padding: 0 14px;
        border: none;
        border-radius: 10px;
        background: #4b6cb7;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        margin: 0;
        min-width: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .send-btn:hover {
        background: #3d5a9e;
    }
    .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
