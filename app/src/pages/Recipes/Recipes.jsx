import React, {useCallback, useEffect, useMemo, useState} from "react";
import MaterialReactTable from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {Link} from "react-router-dom";
import RecipeModal from "../../components/RecipeModal/RecipeModal";
import "bulma/css/bulma.min.css";
import {apiDomain} from "../../utils/utils";
import useFetch from "../../hooks/useFetch";
import {v4 as uuidv4} from "uuid";
import axios from "axios";
import Time from "../../components/Time/Time";

const Recipes = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [currentRowIndex, setCurrentRowIndex] = useState();

    const {loading, error, value} = useFetch(`${apiDomain()}/api/recipes`);

    useEffect(() => {
        setTableData(value);
    }, [value]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "recipeId",
                header: "ID",
                enableColumnOrdering: false,
                enableEditing: false,
                enableSorting: false,
                size: 80,
            },
            {
                accessorKey: "recipeTitle",
                header: "Title",
                size: 140,
            },
            {
                accessorKey: "recipeAuthor",
                header: "Author",
                size: 140,
            },
            {
                accessorKey: "recipeContent",
                header: "Content",
                size: 1240,
            },
            {
                accessorKey: "recipeCategory",
                header: "Category",
                size: 140,
            },
            {
                accessorKey: "createdAt",
                header: "Created At",
                size: 80,
                Cell: ({cell}) => <Time dateString={cell.getValue("createdAt")}/>,
            },
        ],
        []
    );

    const handleCreateNewRow = async (values) => {
        values.recipeId = uuidv4();
        values.createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");

        try {
            const {data} = await axios.post(`${apiDomain()}/api/recipes`, values);
            console.log(data);
        } catch (err) {
            console.log(err);
        }
        tableData.push(values);
        setTableData([...tableData]);
    };

    const handleSaveRowEdits = async (values) => {
        if (!Object.keys(validationErrors).length) {
            const currentRow = tableData[currentRowIndex];
            try {
                const {data} = await axios.put(
                    `${apiDomain()}/api/recipes/${currentRow.recipeId}`,
                    values
                );
                console.log(data);
            } catch (err) {
                console.log(err);
            }
            setTableData((prevTableData) => {
                const newTableData = [...prevTableData];
                newTableData[currentRowIndex] = {...currentRow, ...values};
                return newTableData;
            });
        }
    };

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const handleDeleteRow = useCallback(
        async (row) => {
            if (!confirm(`Are you sure you want to delete ${row.getValue("recipeTitle")}`)) {
                return;
            }
            try {
                const {data} = await axios.delete(
                    `${apiDomain()}/api/recipes/${row.original.recipeId}`
                );
                console.log(data);
            } catch (err) {
                console.log(err);
            }
            tableData.splice(row.index, 1);
            setTableData([...tableData]);
        },
        [tableData]
    );

    return (
        <Box mt={16} minHeight="100%" padding="1rem">
            {/* Recipe Cards Section */}
            <div className="columns is-multiline">
                {tableData?.map((recipe) => (
                    <div className="column is-one-quarter" key={recipe.recipeId}>
                        <div className="card" style={{height: "100%"}}>
                            <div className="card-image">
                                <figure className="image is-4by3">
                                    <img
                                        src={recipe.recipeImage}
                                        alt={recipe.recipeTitle}
                                        style={{objectFit: "cover", height: "200px"}}
                                    />
                                </figure>
                            </div>
                            <div className="card-content">
                                <p className="title is-5">{recipe.recipeTitle}</p>
                                <p className="subtitle is-6">
                                    Author: {recipe.recipeAuthor} <br/>
                                    Category: {recipe.recipeCategory}
                                </p>
                                <Link to={`/recipes/${recipe.recipeId}`} className="button is-link is-small mt-2">
                                    View Recipe
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recipe Table Section */}
            <MaterialReactTable
                displayColumnDefOptions={{
                    "mrt-row-actions": {size: 120},
                }}
                columns={columns}
                data={tableData ?? []}
                editingMode="modal"
                enableColumnOrdering
                enableEditing
                onEditingRowSave={handleSaveRowEdits}
                onEditingRowCancel={handleCancelRowEdits}
                renderRowActions={({row}) => (
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Tooltip arrow placement="left" title="Edit">
                            <IconButton
                                onClick={() => {
                                    setCreateModalOpen(true);
                                    setCurrentRowIndex(row.index);
                                }}
                            >
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="View">
                            <Link to={`/recipes/${row.original.recipeId}`}>
                                <IconButton color="primary">
                                    <OpenInNewIcon/>
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <button
                        className="button is-primary mb-4 mt-4"
                        onClick={() => {
                            setCreateModalOpen(true);
                            setCurrentRowIndex();
                        }}
                    >
                        Create Recipe
                    </button>
                )}
            />

            {/* Modal */}
            <RecipeModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                handleSaveRowEdits={handleSaveRowEdits}
                handleCreateNewRow={handleCreateNewRow}
                tableData={tableData}
                currentRowIndex={currentRowIndex}
            />
        </Box>
    );
};

export default Recipes;