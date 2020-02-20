const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const appConfig = require('../../app_setting.json')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    username: {
        type: String,
        required: () => {
            return true
        },
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    emailConfirmed: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        minlength: [5, 'the password must atleast 5 character'],
        trim: true,
        required: true
    },

    profileImagePath: {
        type: String,
        required: false,
        default: 'placeholder path'
    },
    favorites: [
        {
            type: String
        }
    ],
    createdChannel: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel"
        }
    ],
    
    subscriptions: [
        {
            channelId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Channel",
                required: false
            },

            allowNotification: {
                type: Boolean,
                default: false

            }
        }
    ],

    purchasedContent : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video",
            required : false
        }
    ],

    likedVideoId: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: false


        }

    ],
    watchLaterVideoIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true

        }
    ],
    playlist: [
        {
            playlistId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            playlistName: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 10
            },
            dateCreated: {
                type: Date,
                default: Date.now()
            },
            VideoIds: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Video"

                }
            ]
        }
    ],
    notificationId: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification",
            required: false

        }
    ],
    purchasedContent: [
        {
            videoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            },
            datePurchased: {
                type: Date,
                default: Date.now()
            }
        }
    ]

})


userSchema.statics.findUser = function (userId) {

  return new Promsise((resolve , reject)=>{
    const value = this.model('User').findById(userId).then(result =>{
        if(result){
            resolve(result);
        }else{
            reject(new Error('unable to find the user'));
        }
    })
  })
}

userSchema.pre('save', function (next) {
    if (this.email && this.isModified('email')) {
        this.model('User').findOne({ email: this.email }).then(user => {
            if (user) {
                throw new Error('User Exists')
            }
            next();
        }).catch(error => {
            next(error)
        })
    }

})


userSchema.pre('save', function (next) {

    if (this.password && this.isModified('password')) {
        bcryptjs.hash(this.password, 12)
            .then(hashvalue => {

                this.password = hashvalue;
                next();
            }).catch(error => {
                console.log(error);
            })
    }
})
module.exports = mongoose.model('User', userSchema)