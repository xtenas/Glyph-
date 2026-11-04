import "dotenv/config";
import express from "express";
import pg from "pg";
pg.types.setTypeParser(1082, (val) => val);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new pg.Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      },
);

const port = process.env.PORT || 4000;

app.get("/posts", (req, res) => {
  try {
    db.query("SELECT * FROM posts", (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(result.rows);
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/new_post", (req, res) => {
  const { title, content, category } = req.body; // Get title, content, and category from request parameters
  console.log(title, content, category); // Log the values to the console for debugging
  const date = new Date().toISOString(); // Get the current date and time in ISO format
  try {
    db.query(
      "INSERT INTO posts (title, post_content, category, post_date) VALUES ($1, $2, $3, $4)",
      [title, content, category, date],
      (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.status(201).json({ message: "Post created successfully" });
        }
      },
    );
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/posts/:id", (req, res) => {
  const postid = req.params.id;
  try {
    db.query("SELECT * FROM posts WHERE id = $1", [postid], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else if (result.rows.length === 0) {
        res.status(404).json({ error: "Post not found" });
      } else {
        res.json(result.rows[0]);
      }
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/posts/:id", (req, res) => {
  const postid = req.params.id;
  const { title, content, category } = req.body; // Get title, content, and category from request parameters
  console.log(title, content, category); // Log the values to the console for debugging
  try {
    db.query(
      "UPDATE posts SET title = $1, post_content = $2, category = $3 WHERE id = $4",
      [title, content, category, postid],
      (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.json({ message: "Post updated successfully" });
        }
      },
    );
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/posts/:id", (req, res) => {
  const postid = req.params.id;
  try {
    db.query("DELETE FROM posts WHERE id = $1", [postid], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json({ message: "Post deleted successfully" });
      }
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
