from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
from datetime import datetime
from typing import Optional, List

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or the specific frontend URL, e.g., "http://localhost:8501"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# MySQL Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Shaurya@123",
    database="cooking_recipe_portal"
)
cursor = db.cursor(dictionary=True)


# Models
class Author(BaseModel):
    authorName: str


class Category(BaseModel):
    categoryName: str
    createdAt: datetime
    categoryDescription: str


class Recipe(BaseModel):
    recipeId: str
    recipeTitle: str
    authorName: str
    createdAt: datetime
    recipeContent: str
    recipeCategory: Optional[str] = None
    recipeImage: Optional[str] = None


# Routes
@app.get("/")
def home():
    return {"message": "Cooking Recipe Portal API is running"}


@app.get("/recipes", response_model=List[dict])
def list_recipes():
    query = """
            SELECT r.recipeTitle, a.authorName, r.recipeCategory, r.recipeImage
            FROM recipes r
                     JOIN authors a ON r.authorId = a.authorId \
            """
    cursor.execute(query)
    return cursor.fetchall()


@app.post("/author")
def add_author(author: Author):
    try:
        cursor.execute("INSERT INTO authors (authorName) VALUES (%s)", (author.authorName,))
        db.commit()
        return {"message": "Author added"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.post("/category")
def add_category(cat: Category):
    try:
        cursor.execute("""
                       INSERT INTO categories (categoryName, createdAt, categoryDescription)
                       VALUES (%s, %s, %s)
                       """, (cat.categoryName, cat.createdAt, cat.categoryDescription))
        db.commit()
        return {"message": "Category added"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.get("/categories")
async def get_categories():
    query = "SELECT * FROM categories"
    categories = execute_query(query)
    return categories


@app.post("/recipe")
def add_recipe(recipe: Recipe):
    try:
        cursor.execute("SELECT authorId FROM authors WHERE authorName = %s", (recipe.authorName,))
        author = cursor.fetchone()
        if not author:
            raise HTTPException(status_code=404, detail="Author not found")

        cursor.execute("""
                       INSERT INTO recipes (recipeId, recipeTitle, authorId, createdAt, recipeContent, recipeCategory,
                                            recipeImage)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)
                       """, (recipe.recipeId, recipe.recipeTitle, author["authorId"], recipe.createdAt,
                             recipe.recipeContent, recipe.recipeCategory, recipe.recipeImage))
        db.commit()
        return {"message": "Recipe added"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.delete("/recipe/{recipe_id}")
def delete_recipe(recipe_id: str):
    cursor.execute("DELETE FROM recipes WHERE recipeId = %s", (recipe_id,))
    db.commit()
    return {"message": f"Recipe {recipe_id} deleted (check log for record)."}


@app.get("/deleted-recipes")
def get_deleted_log():
    cursor.execute("SELECT * FROM deleted_recipes_log ORDER BY deletedAt DESC")
    return cursor.fetchall()
