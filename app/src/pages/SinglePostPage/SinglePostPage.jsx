import React from "react";
import styles from "./SinglePostPage.module.css";
import CSSModules from "react-css-modules";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import { BsCalendar3 } from "react-icons/bs";
import useFetch from "../../hooks/useFetch";
import { apiDomain } from "../../utils/utils";
import Loading from "../../components/Loading/Loading";
import Time from "../../components/Time/Time";

const SinglePostPage = () => {
    const { recipeId } = useParams();

    // Fetching data for the recipe
    const { loading, error, value } = useFetch(`${apiDomain()}/api/recipes/${recipeId}`);

    // Return loading component while fetching
    if (loading) {
        return <Loading />;
    }

    // Handle error if any
    if (error) {
        return <div className={styles.error}>Error loading the recipe. Please try again later.</div>;
    }

    // Destructure the value object for easier usage
    const { recipeTitle, recipeCategory, createdAt, recipeAuthor, recipeContent } = value || {};

    return (
        <article className={styles.post}>
            <h2 className={styles.post__title}>{recipeTitle}</h2>
            <hr />
            <p className={styles.post__category}>Category: {recipeCategory}</p>
            <p className={styles.post__date}>
                <BsCalendar3 />
                <Time dateString={createdAt} />
                by <span className={styles.post__author}>{recipeAuthor}</span>
            </p>
            <section className={styles.post__description}>
                {parse(recipeContent)}
            </section>
        </article>
    );
};

export default CSSModules(SinglePostPage, styles, {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
});