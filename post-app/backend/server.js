const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors())

// `npm install mongoose`
const mongoose = require("mongoose");
const options = {
    keepAlive: true,
    connectTimeoutMS: 10000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = `mongodb+srv://code:aman2001@cluster0.cvnwtk9.mongodb.net/?retryWrites=true&w=majority`;

// Mongo DB connection
mongoose.connect(dbUrl, options, (err) => {
    if (err) console.log(err);
});

// Validate DB connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Mongo DB Connected ");
});

// Schema for Book
let Schema = mongoose.Schema;
let postSchema = new Schema(
    {
        id: {
            type: Number,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        author: {
            type: String,
        },
        img: {
            type: String,
        },
        status: {
            type: String,
        }
    },
    { timestamps: true }
);
let PostModel = mongoose.model("post", postSchema);


// Mock Data : We will stop using this static data and will add and remove data from DB itself
let myMockDB = [
    {
        id: 100,
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, voluptatibus corporis! Deserunt doloribus unde magnam, iusto officia cum commodi praesentium?',
        img: 'https://m.media-amazon.com/images/I/51AHZGhzZEL.jpg',
        status: 'todo'
    },
    {
        id: 101,
        title: 'Rework',
        author: 'Jason Fried',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, voluptatibus corporis! Deserunt doloribus unde magnam, iusto officia cum commodi praesentium?',
        img: 'https://m.media-amazon.com/images/P/0307463745.01._SCLZZZZZZZ_SX500_.jpg',
        status: 'inprogress'
    },
]

app.get('/', (req, res) => {
    res.send('Your are lucky!! server is running...');
});



/** GET API: GETs Books from DB and returns as response */
app.get('/posts', async (req, res) => {
    try {
        let posts = await BookModel.find();
        res.status(200).json({
            status: 200,
            data: posts,
        });
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
});


/** POST API: Gets new book info from React and adds it to DB */
app.post('/posts', async (req, res) => {
    const inputBook = req.body;
    console.log(inputBook);
    const matchingBooks = myMockDB.filter(book => book.id === inputBook.id).length;
    if (matchingBooks) {
        res.status(500);
        console.error(`Book with id:${inputBook.id} already exists`);
    } else {
        myMockDB.push(req.body);
    }
    try {
        console.log('input Book:', inputBook);
        let post = new BookModel(inputBook);
        post = await post.save();
        res.status(200).json({
            status: 200,
            data: post,
        });
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
});


app.put("/posts/:postId", async (req, res) => {
    try {
        console.log('PUT request..:' + req.params.bookId);
        let newBook = req.body;
        let book = await BookModel.findByIdAndUpdate({ _id: req.params.bookId }, req.body, {
            new: true,
        }).catch((err) => {
            console.error('Error: ', err);
        });
        if (book) {
            console.log(JSON.stringify(book));
            res.status(200).json({
                status: 200,
                data: book,
            });
        }
        res.status(400).json({
            status: 400,
            message: "Book not found",
        });
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
});


/** DELETE API: Gets ID of the book to be deleted from React and deletes the book in db. 
 * Sends 400 if there is no book with given id
 * Sends 500 if there is an error while saving data to DB
 * Sends 200 if deleted successfully
 */
app.delete("/posts/:postId", async (req, res) => {
    try {
        let post = await PostModel.findByIdAndRemove(req.params.PostId);
        if (post) {
            res.status(200).json({
                status: 200,
                message: "Post deleted successfully",
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "No Post found",
            });
        }
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
});

app.get('/loadSamplePosts', async (req, res) => {
    try {
        myMockDB.forEach(async (postIn) => {
            let post = new PostModel(bookIn);
            post = await post.save();
        });
        res.status(200).json({
            status: 200,
            data: myMockDB,
        });
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
});

app.listen(3001);