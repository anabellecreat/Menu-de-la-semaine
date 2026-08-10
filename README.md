# Mon Menu — IA V3

Version optimisée après les timeouts Vercel.

- image convertie côté iPhone en JPEG ~1200 px / compression 68 %
- appel OpenAI via Chat Completions avec `gpt-4o-mini`
- détail image `low` pour accélérer l'analyse
- sortie JSON compacte
- timeout applicatif de 20 s avec message clair
- `vercel.json` configure la fonction jusqu'à 60 s

La clé `OPENAI_API_KEY` doit rester uniquement dans les variables d'environnement Vercel.
Utiliser l'URL Vercel pour l'application.
