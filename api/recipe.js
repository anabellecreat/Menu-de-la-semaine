export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Méthode non autorisée" }, { status: 405 });
  }

  try {
    const { image, extraText = "" } = await request.json();

    if (!image || typeof image !== "string" || !image.startsWith("data:image/jpeg;base64,")) {
      return Response.json({ error: "Image JPEG invalide ou absente." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "OPENAI_API_KEY n'est pas configurée dans Vercel." }, { status: 500 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          max_tokens: 900,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Tu extrais des recettes à partir de captures d'écran.
N'invente pas ce qui n'est pas lisible. Si une quantité manque, laisse-la vide.
Réponds UNIQUEMENT avec un objet JSON valide.
Champs obligatoires :
name (string),
ingredients (tableau de strings),
steps (tableau de strings),
proteinPerPortion (nombre, estimation),
tags (tableau de strings),
vegetarian (booléen),
containsFish (booléen),
containsMeat (booléen),
containsChicken (booléen),
containsMushrooms (booléen),
notes (string).`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extraText
                    ? `Analyse cette recette. Précision utilisateur : ${extraText}`
                    : "Analyse cette recette."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image,
                    detail: "low"
                  }
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("OpenAI API error:", result);
        return Response.json(
          { error: result?.error?.message || `Erreur OpenAI (${response.status}).` },
          { status: response.status }
        );
      }

      const content = result?.choices?.[0]?.message?.content;
      if (!content) {
        return Response.json({ error: "OpenAI n'a renvoyé aucun résultat." }, { status: 502 });
      }

      let recipe;
      try {
        recipe = JSON.parse(content);
      } catch {
        return Response.json({ error: "La réponse de l'IA n'était pas un JSON valide." }, { status: 502 });
      }

      return Response.json({ recipe });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Recipe function error:", error);
    if (error?.name === "AbortError") {
      return Response.json(
        { error: "L'analyse IA a pris trop de temps. Réessaie avec une capture plus courte." },
        { status: 504 }
      );
    }
    return Response.json(
      { error: error?.message || "Erreur pendant l'analyse de la recette." },
      { status: 500 }
    );
  }
}
