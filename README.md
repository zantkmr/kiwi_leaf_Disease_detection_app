# Kiwi Leaf Disease Detection (ViT + FastAPI + React)

This project is a **full-stack AI application** that detects diseases in Kiwi plant leaves using a **custom-trained Vision Transformer (ViT) model (.pth)** and provides **human-readable explanations** using the **Mistral API (LLM)**.

---

## Tech Stack

| Layer           | Tools                        |
| --------------- | ---------------------------- |
| Frontend        | React + MUI                  |
| Backend API     | FastAPI                      |
| ML Model        | Vision Transformer (PyTorch) |
| LLM Explanation | Mistral API                  |
| Env             | Python venv, Windows, VSCode |

---

## Features

* Upload kiwi leaf image
* Model predicts 4 classes: **Altenaria / Healthy / Nematodes / Phytophora**
* LLM (Mistral) generates treatment explanation in simple language
* Full-stack architecture (React frontend + FastAPI backend)
* CPU-optimized inference (no GPU required)

---

## How It Works

1. User uploads a leaf image in the React UI
2. FastAPI receives the file, preprocesses it, runs inference through ViT model
3. Prediction result is passed to Mistral API for an explanation
4. Response is returned to frontend with:

   * predicted disease
   * simple treatment recommendation

---

## Folder Structure

```
kiwi_app/
 ├── backend/
 │   ├── main.py
 │   ├── models/
 │   │   └── kiwi_vit_aug.pth
 │   └── venv/
 └── frontend/
     └── (React + MUI)
```

---

## Setup Instructions

### Backend

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Make sure `.env` contains:

```
MISTRAL_API_KEY=your_api_key_here
```

---

## Result Example (API Response)

```json
{
  "prediction": "Nematodes",
  "explanation": "This disease is caused by parasitic worms that attack the roots..."
}
```

---
