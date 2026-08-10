export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Méthode non autorisée" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "OPENAI_API_KEY absente de Vercel"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: data?.error?.message || "Erreur OpenAI"
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: data?.choices?.[0]?.message?.content || "Réponse vide"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || "Erreur de connexion à OpenAI"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
