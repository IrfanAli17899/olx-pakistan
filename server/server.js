const express = require('express');
const { mongoose } = require('./db/mongoose');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const { User } = require('./db/models/user')
const { authenticate } = require("./middleware/authenticate")
const app = express();
const PORT = process.env.PORT || 786
const staticPath = path.join(__dirname, '/public')
app.use(bodyParser.json());
app.use(express.static(staticPath))
app.set('view engine', 'hbs');



app.get('/auth', authenticate, (req, res) => {
    res.send(req.user)
})



app.get('/', (req, res) => {
    res.render('index.hbs')
})
app.get('/index.html', (req, res) => {
    res.render('index.hbs')
})

app.get('/register.html', (req, res) => {
    res.render('register.hbs');
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
    res.render('login.hbs')
})

app.post('/login.html', (req, res) => {
    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        user.getAuthToken().then((token) => {
            return res.status(201).header('x-auth', token).send(user)
        });
    })
        .catch((errors) => {
            return res.status(400).send({ errors })
        })

})

app.get('/bikes.html', (req, res) => {
    res.render('ad.hbs',{page:"bikes".toUpperCase()})
})
app.get('/electronicsAppliances.html', (req, res) => {
    res.render('ad.hbs',{page:"electronicsAppliances".toUpperCase()})
})
app.get('/cars.html', (req, res) => {
    res.render('ad.hbs',{page:"cars".toUpperCase()})
})
app.get('/mobiles.html', (req, res) => {
    res.render('ad.hbs',{page:"mobiles".toUpperCase()})
})
app.get('/realEstate.html', (req, res) => {
    res.render('ad.hbs',{page:"realEstate".toUpperCase()})
})
app.get('/furniture.html', (req, res) => {
    res.render('ad.hbs',{page:"furniture".toUpperCase()})
})
app.get('/buy.html', (req, res) => {
    res.render('buy.hbs')
})
app.get('/fav.html', (req, res) => {
    res.render('fav.hbs')
})
app.get('/notification.html', (req, res) => {
    res.render('notification.hbs')
})
app.get('/post-ad.html', (req, res) => {
    res.render('post-ad.hbs')
})
app.get('/myAds.html', (req, res) => {
    res.render('myAds.hbs')
})

//LOGOUT_ROUTE
app.get('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        return res.status(200).send();
    }).catch(() => {
        return res.status(400).send()
    })
})

























app.listen(PORT, () => {
    console.log(`Serving From The Port:${PORT}`);
})