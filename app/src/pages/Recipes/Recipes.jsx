import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "react-router-dom";
import RecipeModal from "../../components/RecipeModal/RecipeModal";
import { apiDomain } from "../../utils/utils";
import useFetch from "../../hooks/useFetch";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Time from "../../components/Time/Time";

const Recipes = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [currentRowIndex, setCurrentRowIndex] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [image, setImage] = useState(null);

    const { loading, error, value } = useFetch(`${apiDomain()}/api/recipes`);

    useEffect(() => {
        if (value) {
            setTableData(value);
        }
    }, [value]);

    const handleCreateNewRow = async (values) => {
        values.recipeId = uuidv4();
        values.createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
        if (image) {
            // Handle image upload and set the image URL in the recipe data
            const formData = new FormData();
            formData.append("image", image);
            try {
                const imageUploadResponse = await axios.post(`${apiDomain()}/api/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                values.recipeImage = imageUploadResponse.data.imageUrl; // assuming the response has imageUrl
            } catch (err) {
                console.error("Error uploading image:", err);
            }
        }

        try {
            await axios.post(`${apiDomain()}/api/recipes`, values);
            setTableData((prev) => [...prev, values]);
            setImage(null); // Reset the image
        } catch (err) {
            console.error("Error creating recipe:", err);
        }
    };

    const handleSaveRowEdits = async (values) => {
        if (!Object.keys(validationErrors).length) {
            const currentRow = tableData[currentRowIndex];
            try {
                await axios.put(`${apiDomain()}/api/recipes/${currentRow.recipeId}`, values);
                setTableData((prev) => {
                    const updated = [...prev];
                    updated[currentRowIndex] = { ...currentRow, ...values };
                    return updated;
                });
            } catch (err) {
                console.error("Error saving recipe edits:", err);
            }
        }
    };

    const handleDeleteRow = useCallback(async (rowIndex) => {
        const recipe = tableData[rowIndex];
        if (!window.confirm(`Are you sure you want to delete "${recipe.recipeTitle}"?`)) return;

        try {
            await axios.delete(`${apiDomain()}/api/recipes/${recipe.recipeId}`);
            const updated = [...tableData];
            updated.splice(rowIndex, 1);
            setTableData(updated);
        } catch (err) {
            console.error("Error deleting recipe:", err);
        }
    }, [tableData]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4}>
                <Typography color="error">Failed to load recipes: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box mt={12} px={3}>
            <Box my={3} display="flex" justifyContent="flex-end">
                <button
                    className="button is-primary"
                    onClick={() => {
                        setCreateModalOpen(true);
                        setCurrentRowIndex(null);
                    }}
                >
                    + Create Recipe
                </button>
            </Box>

            <Grid container spacing={3}>
                {tableData.map((recipe, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.recipeId}>
                        <Card>
                            <Link to={`/recipes/${recipe.recipeId}`}>
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={recipe.recipeImage || "https://via.placeholder.com/400x300?text=No+Image"}
                                    alt={recipe.recipeTitle}
                                    style={{ cursor: "pointer" }}
                                />
                            </Link>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{recipe.recipeTitle}</Typography>
                                <Typography variant="body2" color="text.secondary">By {recipe.recipeAuthor}</Typography>
                                <Typography variant="body2" color="text.secondary">Category: {recipe.recipeCategory}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    <Time dateString={recipe.createdAt} />
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Tooltip title="Edit">
                                    <IconButton onClick={() => {
                                        setCurrentRowIndex(index);
                                        setCreateModalOpen(true);
                                    }}>
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton color="error" onClick={() => handleDeleteRow(index)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="View">
                                    <Link to={`/recipes/${recipe.recipeId}`}>
                                        <IconButton color="primary">
                                            <OpenInNewIcon />
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <RecipeModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                handleSaveRowEdits={handleSaveRowEdits}
                handleCreateNewRow={handleCreateNewRow}
                tableData={tableData}
                currentRowIndex={currentRowIndex}
                columns={[]} // Not needed here but passed for compatibility
                setImage={setImage} // Add image setter to modal
                image={image} // Pass image state to modal
            />
        </Box>
    );
};

export default Recipes;