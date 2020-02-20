const mongoose = require('mongoose');
const appConfig = require('../app_setting.json')
const videoSchema = new mongoose.Schema({
    
    videoTittle: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100

    },
    videoDescription: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    videoType: {
        type: String,
        default: "FREE",
        enum: appConfig.videotypes
    },
    videoTag: [
        {
            type: String,
            enum: appConfig.videotags
        }
    ],
    videoPath: {
        type: String,
        // required: true
    },
    
    originalVideoPath : {
        type : String,
        // required : true
    } , 

    thumbnailPath: {
        type: String,
        // required: true
    },

    originalThumbnailPath : {
        type : String,
        // required : true
    } ,

    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Channel",

    },


    isLive: {
        type: Boolean,
        default: false
    },
    livePath: {
        type: String,
        default: () => this.isLive
    },

    price: {
        type: Number,
        default: () => {
            return  this.videoType === "PREMIUM"
        }
    },
    creditCardNo: {
        type: String,
        default: () => {
            return this.videoType === "PREMIUM"
        }
    },
    purchasedCount : {
        type : Number,
        default : () =>{
            return this.videoType === "PREMIUM"
        }
    },

    licenseKey: {
        type: String,
        default: () => {
            return this.videoType === "PREMIUM"
        }
    },


    watchCount:
    {
        type: Number,
        default: 0
    },
    like: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            date: {
                type: Date,
                default: Date.now()
            },
        }
    ],

    dislike: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            date: {
                type: Date,
                default: Date.now()
            },
        }
    ],
    comment: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            commentData: [
                {
                    text: String,
                    imagePath: String
                }
            ]
        }
    ],
    videoVersionPath: [
        {
            type: String
        }
    ],
    chat: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            text: String,
            imagePath: String
        }
    ]



})

videoSchema.statics.findVideo = function (videoId) {
    return new Promise((resolve, reject) => {

        video.findById(videoId).then(videoResult => {
            if (videoResult) {
                resolve(result)
            }
            reject('user not found')
        }).catch(error => {
            reject(error)
        })
    })
}

videoSchema.statics.getChannelVideos = function (channelId , limit) {
    return new Promise((resolve, reject) => {
        this.model('Video').where('channelId').equals(channelId).populate('comment.userId').limit(limit).then(videoResult => {
            console.log(videoResult);
            resolve(videoResult);
        }).catch(error => {
            reject(error);
        })
    })
}


videoSchema.statics.getMostWatchedVideos = function (channelId , limit) {
    return new Promise((resolve, reject) => {
        this.model('Video').where('channelId').equals(channelId).sort('-watchCount').limit(limit).then(videoResult => {
            console.log(videoResult);
            resolve(videoResult);
        }).catch(error => {
            reject(error);
        })
    })
}


videoSchema.statics.getMostLikedVideos = function(channelId , limit){
    return new Promise((resolve , reject)=>{
        // this.model('Video').where('channelId').equals(channelId)
        this.model('Video').where('channelId').equals(channelId).sort('like').limit(limit).then(likedvideoResult =>{
            console.log(likedvideoResult);
            resolve(likedvideoResult);
        }).catch(error => {
            reject(error);
        })
    })
}

    videoSchema.statics.addVideo = function (videoInfo) {
        return new Promise((resolve, reject) => {
            var video = new this(videoInfo)
            video.save().then(result => {
                resolve(result)
            }).catch(error => {
                reject(error)
            })
        })
    }

videoSchema.statics.removeVideo = function (videoId) {
    return new Promise((resolve, reject) => {
        // 1. remove single videos
        this.model('Video').findByIdAndRemove(videoId).then(result => {
            // 2. then remove video reference from channel playlists
            resolve(result);
        }).catch(error => {
            reject(error)
        })
    })
}

module.exports = mongoose.model('Video', videoSchema)