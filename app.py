from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from utils import Clean_Description
import os
app = FastAPI()

def _parse_origins(value: str):
    origins = []
    for part in (value or "").split(","):
        o = part.strip()
        if o:
            origins.append(o)
    return origins

frontend_origins = _parse_origins(os.getenv("FRONTEND_ORIGINS", ""))

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins if frontend_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request Schema (IMPORTANT)
# -------------------------
class QueryRequest(BaseModel):
    user_query: str
    top_n: int = 5


# -------------------------
# Model Class
# -------------------------
class FoodRecommendation:

    def __init__(self):
        self.vectoriser = joblib.load('vectoriser.pkl')
        self.vector_space = joblib.load('vector_space.pkl')
        self.dataset = pd.read_csv('Dataset.csv')

    def recommend_food(self, user_query, top_n=5):
        item_description = Clean_Description(user_query)
        vectorised_description = self.vectoriser.transform([item_description])

        similarities = cosine_similarity(vectorised_description, self.vector_space)

        similar_indices = similarities[0].argsort()[::-1][1:top_n+1]

        results = self.dataset.iloc[similar_indices][['Item Name', 'Description']]

        return results.to_dict(orient="records")


# -------------------------
# Create Single Instance
# -------------------------
model = None
model_init_error = None
try:
    model = FoodRecommendation()
except Exception as exc:
    model_init_error = str(exc)


@app.get("/")
def homepage():
    return {
        "ev" : "homepage",
        "Status" : "Active"}

@app.post("/recommend")
def recommend_api(request: QueryRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model failed to initialize: {model_init_error}",
        )

    try:
        result = model.recommend_food(request.user_query, request.top_n)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {exc}") from exc
    
    return {
        "query": request.user_query,
        "recommendations": result
    }