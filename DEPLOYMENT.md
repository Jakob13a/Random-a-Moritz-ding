# Deployment Guide - Railway

## Backend (FastAPI)

### Vorbereitungen
1. Registriere dich auf [railway.app](https://railway.app)
2. Installiere Railway CLI: `npm install -g @railway/cli`
3. Logge dich ein: `railway login`

### Deployment auf Railway

```bash
# Im backend/ Verzeichnis:
cd backend
railway init
railway up
```

Oder über die Web-UI:
1. Neues Projekt auf railway.app erstellen
2. Repository verbinden (GitHub)
3. "Add Service" -> "GitHub Repo" -> Backend-Repo auswählen
4. Railway erkennt Python und nutzt das Dockerfile automatisch

### Environment-Variablen (Railway Dashboard)
- Keine speziellen Variablen nötig für die Standard-Installation
- Falls später nötig (DB, Redis, etc.) hinzufügen

### Wichtig!
Nach dem Deployment bekommt das Backend eine öffentliche URL (z.B. `https://moritz-backend-prod.railway.app`). Diese URL muss in Netlify konfiguriert werden:

## Frontend (Next.js auf Netlify)

### Netlify Environment Variables setzen
1. Netlify Dashboard → Site settings → Build & deploy → Environment
2. Neue Variable hinzufügen:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-backend-url.railway.app` (deine Railway URL)

### Deployment
```bash
cd frontend
npm run build
# Dann Netlify CLI oder GitHub Auto-Deploy
```

## Häufige Fehler

### ❌ Backend antwortet nicht / 404 Fehler
→ Prüfe: `NEXT_PUBLIC_API_URL` in Netlify stimmt mit Railway URL überein

### ❌ CORS Fehler
→ Backend hat CORS enabled (`allow_origins=['*']`), sollte okay sein
→ Falls Problem: Railway URL zu Netlify URL hinzufügen

### ❌ Railway Build/Deploy fehlgeschlagen
→ Dockerfile ist vorhanden ✓
→ requirements.txt ist vorhanden ✓
→ Runtime `3.12.17` ist in `.python-version` gespeichert ✓
→ Check Railway logs via CLI: `railway logs`

## Testing

```bash
# Backend lokal testen
cd backend
uvicorn app.main:app --reload

# Frontend auf 3000 starten
cd frontend
npm run dev

# Browser: http://localhost:3000
# Sollte mit localem Backend verbinden
```

## Weitere Infos
- [Railway Docs](https://docs.railway.app)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js auf Netlify](https://docs.netlify.com/frameworks/next-js/overview/)
