import math
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple

app = FastAPI(title="Constellation App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Star(BaseModel):
    id: int
    char: str
    x: float
    y: float
    size: float

class ConstellationData(BaseModel):
    stars: List[Star]
    edges: List[Tuple[int, int]]

def distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculate Euclidean (straight-line) distance between two points."""
    return math.hypot(x2 - x1, y2 - y1)

@app.get("/api/constellation", response_model=ConstellationData)
def get_constellation(text: str = ""):
    """
    Given an input string, generates a deterministic constellation.
    Returns normalized properties (x, y coordinate mapping from 0.0 to 1.0).
    """
    if not text:
        return ConstellationData(stars=[], edges=[])
    
    stars = []

    for i, char in enumerate(text):
        char_val = ord(char)
        
        raw_x = ((char_val * 73) + (i * 17)) % 1000 / 1000.0
        x = 0.1 + (raw_x * 0.8)

        raw_y = ((char_val * 89) + (i * 23)) % 1000 / 1000.0
        y = 0.1 + (raw_y * 0.8)
        
        size = 0.005 + ((char_val % 100) / 100.0 * 0.015) 
        
        stars.append(Star(id=i, char=char, x=x, y=y, size=size))
    
    edges = []

    
    if len(stars) > 1:
        in_tree = [0]
        out_tree = list(range(1, len(stars)))

        while out_tree:
            min_dist = float('inf') 
            best_edge = None
            best_out_node = None

            for u in in_tree:
                for v in out_tree:
                    dist = distance(stars[u].x, stars[u].y, stars[v].x, stars[v].y)
                    
                    if dist < min_dist:
                        min_dist = dist
                        best_edge = (u, v) 
                        best_out_node = v    
                        
            edges.append(best_edge)
            in_tree.append(best_out_node)
            out_tree.remove(best_out_node)
            
    return ConstellationData(stars=stars, edges=edges)