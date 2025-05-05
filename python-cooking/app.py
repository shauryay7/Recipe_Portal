import streamlit as st
import requests
from datetime import datetime
import pandas as pd

API_BASE = "http://localhost:8000"

st.set_page_config(page_title="🍽️ Cooking Recipe Portal", layout="centered")

# Sidebar Navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Home", "Categories", "Recipes"])

# ------------------ HOME PAGE ------------------
if page == "Home":
    st.title("🏠 Welcome to Cooking Recipe Portal")
    try:
        res = requests.get(f"{API_BASE}/")
        if res.status_code == 200:
            st.success(res.json().get("message", "FastAPI backend is running."))
        else:
            st.warning("Backend responded but not with success status.")
    except Exception as e:
        st.error("❌ Unable to connect to backend. Is FastAPI running?")

# ------------------ CATEGORY PAGE ------------------
elif page == "Categories":
    st.title("📚 Add a Category")

    with st.form("category_form"):
        category_name = st.text_input("Category Name")
        category_description = st.text_input("Category Description")
        created_at = st.date_input("Created At", value=datetime.today())
        submit_category = st.form_submit_button("Add Category")

    if submit_category:
        payload = {
            "categoryName": category_name,
            "createdAt": f"{created_at}T00:00:00",
            "categoryDescription": category_description
        }
        try:
            res = requests.post(f"{API_BASE}/category", json=payload)
            if res.status_code == 200:
                st.success("✅ Category added successfully.")
            else:
                st.error(f"❌ Failed: {res.json().get('detail', 'Unknown error')}")
        except Exception as e:
            st.error(f"Error: {e}")

    st.markdown("## 📄 Existing Categories")
    try:
        res = requests.get(f"{API_BASE}/categories")
        if res.status_code == 200:
            df = pd.DataFrame(res.json())
            st.dataframe(df)
        else:
            st.warning("No categories found.")
    except Exception as e:
        st.error("❌ Could not load categories.")
# ------------------ RECIPE PAGE ------------------
elif page == "Recipes":
    st.title("🍲 Recipes")

    if st.button("📜 Load All Recipes"):
        try:
            res = requests.get(f"{API_BASE}/recipes")
            if res.status_code == 200:
                data = res.json()
                df = pd.DataFrame(data)
                st.dataframe(df.drop(columns=["recipeContent"]))  # Drop content to keep it concise
            else:
                st.warning("No recipes found or error fetching.")
        except Exception as e:
            st.error("❌ Could not load recipes.")

    st.markdown("## ➕ Add New Recipe")
    with st.form("recipe_form"):
        recipe_id = st.text_input("Recipe ID")
        recipe_title = st.text_input("Title")
        author_name = st.text_input("Author Name")
        created_at = st.date_input("Created At")
        recipe_content = st.text_area("Content")
        recipe_category = st.text_input("Category Name")
        recipe_image = st.text_input("Image URL (optional)")
        submit_recipe = st.form_submit_button("Add Recipe")

    if submit_recipe:
        payload = {
            "recipeId": recipe_id,
            "recipeTitle": recipe_title,
            "authorName": author_name,
            "createdAt": f"{created_at}T00:00:00",
            "recipeContent": recipe_content,
            "recipeCategory": recipe_category,
            "recipeImage": recipe_image or None
        }
        try:
            res = requests.post(f"{API_BASE}/recipe", json=payload)
            if res.status_code == 200:
                st.success("✅ Recipe added successfully.")
            else:
                st.error(f"❌ Failed: {res.json().get('detail', 'Unknown error')}")
        except Exception as e:
            st.error(f"Error: {e}")