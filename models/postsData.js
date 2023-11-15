const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true,
        default: `${Date().slice(4,25)}`
    }
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;