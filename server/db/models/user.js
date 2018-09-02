const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 4,
        required: true,
        trim: true
    },
    email: {
        type: String,
        minlength: 8,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value)
            },
            message: 'Email Address Is Not Valid'
        },
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    userImg: {
        type: String,
        default: 'images/userImg.jpg'
    },
    contact: {
        type: Number,
        required:true,
        minlength:12,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObj = user.toObject();
    return { _id: userObj._id, email: userObj.email }
}

// Hashing Of Password

UserSchema.pre('save', function (done) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                done();
            })
        })
    } else {
        done();
    }
})

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject({
                email: { message: "User Not Found" }
            })
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    return resolve(user);
                }
                return reject({ password: { message: "Password Not Matched" } })
            })
        })
    })
}


UserSchema.methods.getAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, '17899').toString();
    user.tokens.push({ access, token })
    return user.save().then(() => {
        return token
    })

}










const User = mongoose.model('User', UserSchema);
module.exports = { User }