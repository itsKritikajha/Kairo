import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, depth = 'intermediate', model = 'gemini' } = body;

    const lastUserMessage = messages && messages.length > 0 
      ? messages[messages.length - 1].content 
      : 'Hello KAIRO';

    const textLower = lastUserMessage.toLowerCase();

    let replyContent = "";

    if (textLower.includes('debug') || textLower.includes('error') || textLower.includes('bug')) {
      replyContent = `🛠️ **KAIRO Code Debugger (${depth.toUpperCase()})**:\n\n` +
        `I analyzed your code snippet. Here is the diagnostic breakdown:\n\n` +
        `1. **Root Cause**: Unhandled async promise rejection or null dereference.\n` +
        `2. **Fixed Code Solution**:\n\`\`\`typescript\ntry {\n  const res = await fetch('/api/data');\n  if (!res.ok) throw new Error('API Request Failed');\n  const data = await res.json();\n  return data;\n} catch (err) {\n  console.error('Handled gracefully:', err);\n}\n\`\`\`\n` +
        `3. **Best Practice**: Always validate response status headers before calling \`.json()\`.`;
    } else if (textLower.includes('recursion') || textLower.includes('dsa') || textLower.includes('tree')) {
      replyContent = `🧮 **KAIRO DSA Tutor (${depth.toUpperCase()})**:\n\n` +
        `Let's break down this Data Structure topic:\n\n` +
        `• **Time Complexity**: O(N log N) average case.\n` +
        `• **Space Complexity**: O(N) call stack depth.\n` +
        `• **Optimal Strategy**: Define a clear base case to avoid stack overflow errors.\n\n` +
        `\`\`\`python\ndef fibonacci(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 2: return 1\n    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)\n    return memo[n]\n\`\`\n` +
        `Try memoization to reduce recursive complexity from O(2ᴺ) to O(N)!`;
    } else if (textLower.includes('system design') || textLower.includes('architecture')) {
      replyContent = `📐 **KAIRO System Design Coach (${depth.toUpperCase()})**:\n\n` +
        `Key architectural layers for production scale:\n\n` +
        `1. **API Gateway & Load Balancer**: NGINX / Cloudflare distributing traffic.\n` +
        `2. **Database & Cache Layer**: PostgreSQL (Relational) + Redis (In-Memory Key-Value Cache).\n` +
        `3. **Message Queue**: Kafka or RabbitMQ for asynchronous worker processing.`;
    } else {
      replyContent = `💡 **KAIRO AI Mentor (${depth.toUpperCase()})**:\n\n` +
        `Great question! Moving from **Confusion → Clarity** on "${lastUserMessage}" requires 3 steps:\n\n` +
        `1. **Core Concept**: Master the fundamental input/output boundaries.\n` +
        `2. **Hands-on Practice**: Build a minimal 10-line working snippet.\n` +
        `3. **Real-world Application**: Test edge cases and boundary conditions.\n\n` +
        `Keep building your consistency every day, Kritika! 🚀`;
    }

    // Check if real Gemini or OpenAI API key is present in environment
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (model === 'gemini' && geminiKey) {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `System: You are KAIRO, an AI Mentor for tech students. Depth: ${depth}. User query: ${lastUserMessage}` }] }]
        })
      });
      const geminiData = await geminiRes.json();
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
        replyContent = geminiData.candidates[0].content.parts[0].text;
      }
    } else if (model === 'openai' && openaiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: `You are KAIRO AI Mentor. Depth: ${depth}. Provide concise, clear explanations.` },
            { role: 'user', content: lastUserMessage }
          ]
        })
      });
      const openaiData = await openaiRes.json();
      if (openaiData.choices && openaiData.choices[0]?.message?.content) {
        replyContent = openaiData.choices[0].message.content;
      }
    }

    return NextResponse.json({
      role: 'AI',
      content: replyContent,
      depth,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process AI chat query' }, { status: 500 });
  }
}
