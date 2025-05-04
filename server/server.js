const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

const recipesRouter = require("./routes/recipes");
const categoriesRouter = require("./routes/categories");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store uploaded files in the 'uploads' directory
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Use the original file name with a timestamp to avoid collisions
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter for image files only (you can adjust this as needed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

// Set up multer for file uploads
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files (images) from the 'uploads' folder
app.use("/uploads", express.static("uploads"));

// Image upload route (single file upload)
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Respond with the file path (URL) for frontend usage
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.use("/api/recipes", recipesRouter);
app.use("/api/categories", categoriesRouter);

app.listen(3000, () => {
  console.log("server listening on port 3000");
});