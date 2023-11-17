const express = require('express');
const app = express();
require('dotenv').config()
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const path = require('path');
const { uuid } = require('uuidv4');
const methodOverride = require('method-override');
const dbUrl = process.env.KEY;
const localUrl = 'mongodb://127.0.0.1:27017/p-blog';
const Post = require('./models/postsData');
const User = require('./models/newUser');
const bcrypt = require('bcrypt');
//const postsData = require('./seeds');

// Connect to your MongoDB database
//`${dbUrl}` - online
//localUrl - local
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

app.get('/users', async (req, res) => {
    res.send('here are your users');
});

//POST Requests
app.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    console.log(newPost);
    res.redirect('/');
});

app.post('/signup', async (req, res) => {
    const newUser = new User(req.body);
    const existingUser = await User.findOne({ username: newUser.username });

    newUser.password = await bcrypt.hash(newUser.password, 10) //hashing user pw - not visible in DB
    .catch(err => {
        console.error("Error hashing password:", err);
        res.status(500).send("Error creating user.");
    });
    
    if (existingUser) {
        res.send('User already exists.'); //Needs a seperate EJS page
    } else {

        await newUser.save()
        .then(() => {
            res.send(`Hi ${newUser.username}, Your account has been created successfully!`);
        })
        .catch((err) => {
            console.log(err)
            res.send(err)
        })
    }
});

app.post('/login', async (req, res) => {
    const loginName = req.body.username;
    const loginPassword = req.body.password;
    
    const findUser = await User.findOne({ username: loginName }) //finding user in DB
        .catch((err) => {
            console.log(err);
        });

    if (findUser !== null) {
        const passwordMatch = await bcrypt.compare(loginPassword, findUser.password); //check if pw entered by user is same as in DB
        if (passwordMatch) {
            res.send('Logged in successfully');
        } else {
            console.log('Invalid password')
        }
    } else {
        console.log('Invalid username')
    }
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