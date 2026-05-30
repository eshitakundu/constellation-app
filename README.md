# ✦ Constellation App ✦

An interactive, celestial web application that generates unique, deterministic star constellations from text input. Built with a FastAPI backend and a custom p5.js canvas frontend.

## 🌌 Overview

The **Constellation App** maps any text input (like a name or phrase) into a beautiful, personalized star constellation. The backend dynamically determines star coordinates, brightness, and connection paths using a custom Minimum Spanning Tree (MST) algorithm, ensuring the same input always yields the exact same cosmic fingerprint. The frontend renders these star systems on an interactive canvas featuring twinkling background fields, floating nebulas, and glowing star hubs.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & Vanilla CSS**: Custom layout, glowing titles, responsive styling, and custom inputs.
- **p5.js**: Interactive 2D canvas rendering background drift stars, glowing interactive nodes, and smooth connection reveals.
- **Google Fonts**: `Cinzel` (UI readability) and `Cinzel Decorative` (celestial title styling).

### Backend
- **Python 3.12+**
- **FastAPI**: Lightweight web framework for serving the API.
- **Uvicorn**: ASGI web server.
- **Pydantic**: Data validation and representation.

---

## 📁 Project Structure

```text
constellation-app/
├── backend/
│   ├── main.py                # FastAPI server & constellation generator
│   └── requirements.txt       # Production python dependencies
├── frontend/
│   ├── index.html             # Main entrypoint
│   ├── style.css              # Custom styling
│   └── sketch.js              # p5.js rendering logic
├── pyproject.toml             # uv/Python project metadata
└── README.md                  # Project documentation
```

---

## 🚀 Running Locally

### 1. Run the Backend API

You can start the FastAPI backend using standard Python or `uv`.

#### Using `uv` (Recommended):
```powershell
uv run python -m uvicorn backend.main:app --reload
```
*(Note: If `uv run uvicorn` fails with script path errors, run via python module command: `uv run python -m uvicorn backend.main:app --reload`)*

#### Using standard Python & pip:
1. Install dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```
2. Start the server:
   ```powershell
   python -m uvicorn backend.main:app --reload
   ```

The backend server will run at `http://127.0.0.1:8000`.

### 2. Run the Frontend

Serve the static files under `/frontend` using any simple HTTP server.

#### Using Python:
```powershell
python -m http.server 8080 --directory frontend
```

#### Using Node/npm:
```powershell
npx http-server frontend -p 8080
```

Open your browser and navigate to **`http://localhost:8080`**.

---
