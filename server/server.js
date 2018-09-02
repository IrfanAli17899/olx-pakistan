const express = require('express');
const { mongoose } = require('./db/mongoose');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const { User } = require('./db/models/user')

const app = express();
const PORT = process.env.PORT || 786
const staticPath = path.join(__dirname, '/public')
app.use(bodyParser.json());
app.use(express.static(staticPath))
app.set('view engine', 'html');
app.engine('html', hbs.__express);


app.get('/register.html', (req, res) => {
    res.render('register.html');
})
app.post('/register.html', (req, res) => {
    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        contact: req.body.contact,
        userImg: req.body.userImg
    })
    user.save().then((user) => {
        return res.status(201).send(user)
    }).catch((err) => {
        if (err.code == 11000) {
            res.status(406).send({
                errors: {
                    email: {
                        message: "Email Adress Already Exists"
                    }
                },

            })
        }
        res.status(406).send(err)
    })
})
app.get('/login.html', (req, res) => {
    res.render('login.html')
})
app.get('/', (req, res) => {
    res.render('login.html')
})

app.post('/login.html', (req, res) => {
    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        // return res.status(200).send(user)
        user.getAuthToken().then((token) => {
            return res.status(201).header('x-auth', token).send(user)
        });
    })
        .catch((errors) => {
            return res.status(400).send({ errors })
        })

})








app.listen(PORT, () => {
    console.log(`Serving From The Port:${PORT}`);
})