import express from "express";
import axios from "axios";
import methodOverride from "method-override";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:4000";

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    res.render("index.ejs", { posts: response.data });
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Error fetching posts");
  }
});
app.get("/posts/new", async (req, res) => {
  res.render("new.ejs");
});
app.post("/new", async (req, res) => {
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Body:", req.body);
  try {
    const response = await axios.post(`${API_URL}/new_post`, req.body);
    res.redirect("/");
  } catch (error) {
    console.error("Error creating post:", error); // Log only the first 1000 characters of the error for brevity
    res.status(500).send("Error creating post");
  }
});

app.get("/posts/:id", async (req, res) => {
  const postid = req.params.id;
  try {
    const response = await axios.get(`${API_URL}/posts/${postid}`);
    res.render("post.ejs", { post: response.data });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Error fetching post");
  }
});

app.delete("/posts/:id", async (req, res) => {
  const postid = req.params.id;
  try {
    await axios.delete(`${API_URL}/posts/${postid}`);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Error deleting post" });
  }
});

app.get("/posts/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    res.render("edit.ejs", { post: response.data });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Error fetching post");
  }
});

app.post("/posts/edit/:id", async (req, res) => {
  const postid = req.params.id;
  try {
    await axios.put(`${API_URL}/posts/${postid}`, req.body);
    res.redirect(`/posts/${postid}`);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Error updating post" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
