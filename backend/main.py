from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import requests
import io
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load processor and model
processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = ViTForImageClassification.from_pretrained(
    "google/vit-base-patch16-224",
    num_labels=4,
    ignore_mismatched_sizes=True
)

# Load weights and class names from checkpoint
checkpoint = torch.load("models/kiwi_vit_aug.pth", map_location="cpu")
model.load_state_dict(checkpoint["model_state_dict"])
model.eval()
CLASS_NAMES = checkpoint["classes"]

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    # Use processor for preprocessing
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predicted = torch.argmax(outputs.logits, dim=1)
        prediction = CLASS_NAMES[predicted.item()]

    # Call Mistral API
    mistral_response = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.getenv('MISTRAL_API_KEY')}"},
        json={
            "model": "mistral-medium",
            "messages": [
                {"role": "system", "content": "You are an expert plant disease assistant."},
                {"role": "user", "content": f"The model predicted {prediction} disease on kiwi leaves. Explain this disease and its possible treatments simply."}
            ]
        }
    )

    response_json = mistral_response.json()
    try:
        explanation = response_json["choices"][0]["message"]["content"]
    except KeyError:
        explanation = response_json  # Debug: return full response if format changes

    return {"prediction": prediction, "explanation": explanation}
