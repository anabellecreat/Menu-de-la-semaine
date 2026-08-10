export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Méthode non autorisée" }, { status: 405 });
  }

  try {
    const { image, extraText = "" } = await request.json();

    if (!image) {
      return Response.json({ error: "Aucune image reçue." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY n'est pas configurée dans Vercel." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyse cette capture d'écran de recette. N'invente pas les informations illisibles.
${extraText ? `Précision de l'utilisateur : ${extraText}` : ""}

Extrais le nom, ingrédients et quantités, étapes, protéines estimées par portion, nombre de portions, type de cuisine, tags, végétarien, poisson, viande, poulet, champignons, qualité pour le lendemain sur 5 et remarques.`
            },
            { type: "input_image", image_url: image, detail: "high" }
          ]
        }],
        text: {
          format: {
            type: "json_schema",
            name: "recipe",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
                steps: { type: "array", items: { type: "string" } },
                proteinPerPortion: { type: "number" },
                servings: { type: "number" },
                cuisine: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                vegetarian: { type: "boolean" },
                containsFish: { type: "boolean" },
                containsMeat: { type: "boolean" },
                containsChicken: { type: "boolean" },
                containsMushrooms: { type: "boolean" },
                leftoversScore: { type: "integer" },
                notes: { type: "string" }
              },
              required: [
                "name", "ingredients", "steps", "proteinPerPortion",
                "servings", "cuisine", "tags", "vegetarian",
                "containsFish", "containsMeat", "containsChicken",
                "containsMushrooms", "leftoversScore", "notes"
              ]
            }
          }
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: result?.error?.message || "Erreur OpenAI." },
        { status: response.status }
      );
    }

    return Response.json({ recipe: JSON.parse(result.output_text) });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Erreur pendant l'analyse de la recette." },
      { status: 500 }
    );
  }
}
