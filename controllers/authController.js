const jwt = require('jsonwebtoken');
const authLocal = require('../middleware/authMiddleware')
const appconfig = require('../app_setting.json')
const { validationResult } = require('express-validator/check')

const User = require('../models/authmodel/user')


exports.currentUserInfo = (req, res, next) => {
    if (req.user) {
        res.status(200).json(req.user)
    }
}

exports.postRegister = (req, res, next) => {
    const { firstName, lastName, username, email, password, imagepath, favorites } = req.body;
    var user = new User({
        firstName: firstName, lastName: lastName, username: username, email: email, password: password,
        profileImagePath: imagepath, favorites: favorites
    })
    user.save().then(result => {

        const token = jwt.sign({ id: result._id, username: result.username, email: result.email, createdChannel: result.createdChannel }, appconfig.jwtsecretkey, { expiresIn: '1h' })
        res.status(200).json({ token: token });
    }).catch(error => {
        res.status(422).json({ error: error.message })
    })

}



exports.postLogin = async (req, res, next) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
        console.log('errors', validationError.array())
        return next(validationError.array())
    }
    if (req.user) {
        const token = jwt.sign({ ...req.user._doc }, appconfig.jwtsecretkey, { expiresIn: '1h' })
        console.log('token' , req.user._doc);
        res.status(200).json({ token: token })
    }

    // id: req.user._id, username: req.user.username, email: req.user.email , createdChannel : req.user.createdChannel  
}


exports.facebookLogin = (req, res, next) => {

    res.status(200).json({ title: "succuss" })
}

exports.googleLogin = (req, res, next) => {

    res.status(200).json({ title: "succuss" })
}


exports.resetPassword = (req, res, next) => {

}

exports.signOut = (req, res, next) => {

}


exports.Profile = (req, res, next) => {
    const { _id } = req.params
    User.findById(_id).populate('createdChannel').populate('subscriptions.channelId')
        .then(result => {
            res.status(200).json(result);
        }).catch(error => {
            console.log(error);
        })
}
