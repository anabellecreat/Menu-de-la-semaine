# Mon Menu — IA V1

Ajoute une analyse IA des captures de recettes.

Architecture :
- index.html : application
- api/recipe.js : fonction Vercel sécurisée
- OPENAI_API_KEY : variable d'environnement Vercel

Important : utilise l'URL Vercel pour l'application, pas uniquement GitHub Pages, car GitHub Pages n'exécute pas /api/recipe.

Après déploiement : 📸 Trouvée → choisir une capture → 🤖 Analyser avec l'IA.

Ne partage jamais ta clé OPENAI_API_KEY.
