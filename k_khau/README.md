# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Backend API (FastAPI)

This frontend is meant to talk to the backend in `../app.py`.

- **API endpoint used**: `POST /recommend`
- **Dev proxy**: Vite proxies `/recommend` to `http://localhost:8000` (see `vite.config.js`)
- **Production API base URL**: set `VITE_API_BASE_URL` (Cloudflare Pages env var)

### Run backend

From the repo root:

```bash
uvicorn app:app --reload --port 8000
```

### Run frontend

From `k_khau/`:

```bash
npm install
npm run dev
```

## Deploy (Cloudflare Pages + Render)

### Cloudflare Pages (frontend)

- **Root directory**: `k_khau`
- **Build command**: `npm ci && npm run build`
- **Output directory**: `dist`
- **Environment variables**:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

### Render (backend)

- **Build command**: `pip install -r requirements.txt`
- **Start command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Environment variables** (recommended):
  - `FRONTEND_ORIGINS=https://<your-project>.pages.dev,https://<your-custom-domain>`
