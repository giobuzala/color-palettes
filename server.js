/**
 * Local dev server: serves static files from docs/ and proxies /api/chat to OpenAI.
 * Run with: node server.js (or npm run dev:server).
 * Set OPENAI_API_KEY in .env.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const DOCS = path.join(__dirname, 'docs');

function serveStatic(filePath, res) {
    const ext = path.extname(filePath);
    const types = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
    };
    const contentType = types[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

async function handleApiChat(body, res) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || !key.trim()) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not set. Add it to .env' }));
        return;
    }

    let parsed;
    try {
        parsed = JSON.parse(body);
    } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
    }

    const { messages, systemPrompt } = parsed || {};
    if (!Array.isArray(messages) || !systemPrompt) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Body must include messages and systemPrompt' }));
        return;
    }

    const payload = {
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.role === 'user' || m.role === 'assistant')
        ]
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key.trim()}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok) {
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: data?.error?.message || 'OpenAI error' }));
            return;
        }

        const content = data?.choices?.[0]?.message?.content ?? 'I could not generate a response.';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e?.message || 'Request failed' }));
    }
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/chat') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => handleApiChat(body, res));
        return;
    }

    // Serve docs/index.html for root and static assets for everything else.
    let url = req.url === '/' ? '/index.html' : req.url;
    url = url.split('?')[0];
    if (url.startsWith('/api/')) {
        res.writeHead(404);
        res.end();
        return;
    }
    const filePath = path.join(DOCS, url.replace(/^\//, '').split('/').join(path.sep));
    serveStatic(filePath, res);
});

server.listen(PORT, () => {
    console.log(`Dev server: http://localhost:${PORT}`);
    console.log('Ask AI uses OPENAI_API_KEY from .env');
});
