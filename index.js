const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const path = require('path');
const { uuid } = require('uuidv4');
const methodOverride = require('method-override');
const dbUrl = process.env.DB_URL;
const Post = require('./models/postsData');
//const postsData = require('./seeds');

//DB_URL=mongodb+srv://our-first-user:q3tWJ5lFNIAEhLZN@cluster0.2h6tywl.mongodb.net/?retryWrites=true&w=majority

//atlas-user
//our-first-user
//q3tWJ5lFNIAEhLZN

// Connect to your MongoDB database
//local --> mongodb://127.0.0.1:27017/p-blog
mongoose.connect(`${dbUrl}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
    .then(() => {
        console.log("MONGO CONNECTED")
    })
    .catch((err) => {
        console.log("Mongo connection error!!")
        console.log(err);
    })


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}))
app.use(express.json())
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//GET Requests
app.get('/', async (req, res) => { //home
    const postsData = await Post.find({}).sort({"date":-1}) //Legfrissebb dátummal kezdődik a felsorolás!
    res.render('home', { postsData });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/posts/new', (req, res) => {
    res.render('new');
});

app.get('/posts/:id', async (req, res) => { //post-show
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('show', { post });
});

app.get('/posts/:id/edit', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('edit', { post });
});

app.get('/posts/:id/delete', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('delete', { post });
});

//POST Requests
app.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    console.log(newPost);
    res.redirect('/');
});

//PATCH
app.patch('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const foundPost = await Post.findByIdAndUpdate(id, req.body, { runValidators: true })
    console.log(foundPost);
    res.redirect('/');
});

//DELETE
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const foundPost = await Post.findByIdAndDelete(id)
    res.redirect('/');
});


//Listen
app.listen(port, () => {
    console.log('Server started! - Port: 3000');
});