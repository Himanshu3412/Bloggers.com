import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.post('/submit', (req, res) => {
    const { title, category, content, author } = req.body;
    const newPost = { title, category, content, author, date: new Date() };

    const dataFilePath = path.join(__dirname, 'data.json');

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading data file:', err);
            res.status(500).send('Internal server error');
            return;
        }

        const posts = data ? JSON.parse(data) : [];
        posts.push(newPost);

        fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                console.error('Error writing data file:', err);
                res.status(500).send('Internal server error');
                return;
            }

            res.render("create.ejs", { success: true });
        });
    });
});


app.get("/post", (req, res) => {
    const dataFilePath = path.join(__dirname, 'data.json');

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            res.status(500).send('Internal server error');
            return;
        }

        const posts = JSON.parse(data);
        const page = parseInt(req.query.page) || 1;
        const postsPerPage = 4;
        const totalPosts = posts.length;
        const totalPages = Math.ceil(totalPosts / postsPerPage);

        const startIndex = (page - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, totalPosts);
        const postsToDisplay = posts.slice(startIndex, endIndex);

        res.render("post.ejs", {
            blogs: postsToDisplay,
            currentPage: page,
            totalPages: totalPages
        });
    });
});

app.get("/post/:id", (req, res) => {
    const postId = parseInt(req.params.id);
    const dataFilePath = path.join(__dirname, 'data.json');

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            res.status(500).send('Internal server error');
            return;
        }

        const posts = JSON.parse(data);

        if (postId >= 0 && postId < posts.length) {
            const post = posts[postId];
            res.render("postDetail.ejs", { blog: post });
        } else {
            res.status(404).send('Post not found');
        }
    });
});

app.get("/contact", (req,res) => {
    res.render("contact.ejs");
});

app.post("/send-message", (req, res) => {
    const { name, email, message } = req.body;
    const newMessage = { name, email, message, date: new Date() };

    const messagesFilePath = path.join(__dirname, 'messages.json');

    fs.readFile(messagesFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading messages file:', err);
            res.status(500).send('Internal server error');
            return;
        }

        const messages = data ? JSON.parse(data) : [];
        messages.push(newMessage);

        fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error('Error writing messages file:', err);
                res.status(500).send('Internal server error');
                return;
            }

            res.render("contact.ejs", { success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
