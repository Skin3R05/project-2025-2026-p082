# Deploying IPBot to Hugging Face Spaces

IPBot runs as a free Docker web app (FastAPI + custom frontend) on Hugging Face Spaces (16 GB RAM, no cost).

## 1. Create the Space
1. Sign up / log in at https://huggingface.co
2. Click your avatar → **New Space**.
3. Give it a name (for example `ipbot`), choose **Docker** as the SDK (Blank template), and create it. The `Dockerfile` in this repo runs the FastAPI app.

## 2. Add the Groq key as a secret
In the Space: **Settings → Variables and secrets → New secret**
- Name: `GROQ_API_KEY`
- Value: your `gsk_...` key

The app reads it from this secret, so no `.env` file is needed on the server.

## 3. Push the project to the Space
The Space is a git repository. Commit your work, then from the project folder:
```bash
git remote add space https://huggingface.co/spaces/<your-username>/ipbot
git push space main
```
When asked for a password, use a Hugging Face access token (create one at
https://huggingface.co/settings/tokens).

The Space then installs the requirements, downloads the embedding model once,
and starts the app. The first build takes a few minutes.

## Notes
- The search index is built when the image is built (the `Dockerfile` runs `python run_pipeline.py`), so it always matches the server's libraries. If the index is ever missing, the app rebuilds it from `Knowledge_Base/` on first use.
- If you change the documents in `Knowledge_Base/`, push them and the index updates on the next build. Run `python run_pipeline.py` to preview locally.
