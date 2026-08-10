export default async function handler(request) {
  if (request.method !== "GET") {
    return Response.json({ error: "Méthode non autorisée" }, { status: 405 });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { ok: false, error: "OPENAI_API_KEY absente de Vercel." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Réponds uniquement par OK"
          }
        ],
        max_tokens: 5
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OpenAI test error:", result);
      return Response.json(
        { ok: false, error: result?.error?.message || "Erreur OpenAI." },
        { status: response.status }
      );
    }

    return Response.json({
      ok: true,
      message: result?.choices?.[0]?.message?.content || "Réponse vide"
    });
  } catch (error) {
    console.error("OpenAI test exception:", error);
    return Response.json(
      { ok: false, error: error?.message || "Erreur inconnue." },
      { status: 500 }
    );
  }
}
