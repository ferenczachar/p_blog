const express = require('express');
const app = express();
require('dotenv').config()
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const path = require('path');
const { uuid } = require('uuidv4');
const methodOverride = require('method-override');
const dbUrl = `${process.env.KEY}`;
const localUrl = 'mongodb://127.0.0.1:27017/p-blog';
const Post = require('./models/postsData');
const User = require('./models/newUser');
const bcrypt = require('bcrypt');
const session = require('express-session');
//const postsData = require('./seeds');

// Connect to your MongoDB database
//`${dbUrl}` - online
//localUrl - local
mongoose.connect(dbUrl, {
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
app.use(session({secret: 'notagoodsecret'}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//Middlewares
const requireLogin = (req, res, next) => {
    if(!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
};

//GET Requests
app.get('/', async (req, res) => { //home
    //const postsData = await Post.find({}).sort({"date":-1}) //Legfrissebb dátummal kezdődik a felsorolás!
    let postsData;
    
    // Check if a search query is provided
    if (req.query.search) {
        // Use a regular expression to perform case-insensitive search
        const regex = new RegExp(req.query.search, 'i');
        postsData = await Post.find({ title: regex }).sort({ "_id": 1 });
    } else {
        // If no search query, retrieve all posts
        postsData = await Post.find({}).sort({ "_id": -1 });
    }

    const thisUser = req.session.username;
    res.render('home', { postsData, thisUser });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/posts/new', requireLogin, (req, res) => {
    res.render('new');
});

app.get('/posts/:id', async (req, res) => { //post-show
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('show', { post });
});

app.get('/posts/:id/edit', requireLogin, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('edit', { post });
});

app.get('/posts/:id/delete', requireLogin, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('delete', { post });
});

app.get('/users', async (req, res) => {
    res.send('here are your users');
});

app.get('/dashboard', requireLogin, (req, res) => {
    const thisUser = req.session.username;
    res.render('dashboard', { thisUser });
});

//POST Requests
app.post('/', requireLogin, async (req, res) => {
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
            res.redirect('/login');
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
            req.session.user_id = findUser._id;
            req.session.username = findUser.username;
            res.redirect('/dashboard');
        } else {
            console.log('Invalid password')
            res.redirect('/login');
        }
    } else {
        console.log('Invalid username')
        res.redirect('/login');
    }
});

app.post('/logout', requireLogin, (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//PATCH
app.patch('/posts/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    const foundPost = await Post.findByIdAndUpdate(id, req.body, { runValidators: true })
    console.log(foundPost);
    res.redirect('/');
});

//DELETE
app.delete('/posts/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    const foundPost = await Post.findByIdAndDelete(id)
    res.redirect('/');
});


//Listen
app.listen(port, () => {
    console.log('Server started! - Port: 3000');
});