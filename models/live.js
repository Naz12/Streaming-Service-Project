const mongoose = require('mongoose');
const appConfig = require('../app_setting.json')
const liveSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        required: true
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",

    },
    tag: {
        type: String,
        required: true,
        enum: appConfig.livetags
    },
    date: {
        type: Date,
        default: Date.now()
    }
})


liveSchema.statics.isLiveStreamExists = function (chanId) {
    return new Promise((resolve, reject) => {
        this.model('Live').findOne({ channelId: chanId }).then(result => {
            console.log(result)
            if (!result) {
                console.log(result)
                resolve();
            } else {
                reject()
            }


        }).catch(error => { next(error) })
    })
}

liveSchema.statics.findPreviouslyLiveVideo = function (videoId) {

    return new Promise((resolve, reject) => {
        this.model('Live').find({ videoId: { $in: [...videoId] } }).then(liveresult => {
            if (liveresult) {
                var ids = [...videoId]
                liveresult.forEach(live => {
                    var videoIndex = ids.indexOf(live.videoId.toString())
                    ids.splice(videoIndex, 1)
                });
                this.model('Video').find({ _id: { $in: [...ids] } }).then(result => {
                    resolve(result);
                }).catch(error => {
                    reject(error)
                })
            } else {
                this.model('Video').find({ _id: { $in: [...videoId] } }).then(result => {
                    resolve(result);
                }).catch(error => {
                    reject(error)
                })

            }

        }).catch(error => {
            throw (error)
        })
    })
}

liveSchema.statics.getLiveStreamfromSubscription = function (channelIds) {
    console.log('sub', channelIds)
    return new Promise((resolve, reject) => {
        if (channelIds) {
            this.model('Live').find({ channelId: { $in: [...channelIds] } }).populate('videoId').then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            })
        } else { reject('not found') }

    })
}

liveSchema.statics.getLiveStreamUsingTag = function (tag) {
    return new Promise((resolve, reject) => {
        this.model('Live').findOne({ tag: tag }).then(result => {
            resolve(result);
        }).catch(error => {
            reject(error);
        })
    })
}

liveSchema.statics.getLiveChatHistory = function (videoId) {
    return new Promise((resolve, reject) => {
        this.model("Video").findById(videoId, "chat").populate('chat.userId','username').then(result => {

            console.log('check' , result);
             resolve(result.chat);
           
        }).catch(error => {
            reject(error);
        })
    })
}


liveSchema.statics.saveLiveChat = function (videoId, userId, chatText, imagePath) {
    return new Promise((resolve, reject) => {
        this.model('Video').findById(videoId).populate('chat.userId' , 'username').then(result => {
            if (result.chat == undefined) {
                result.chat = [{ userId: userId, text: chatText, imagePath: imagePath }]
            }
            else {
                result.chat = [...result.chat, { userId: userId, text: chatText, imagePath: imagePath }]
            }
            return this.model('Video')(result).save()
        })
            .then(result => {
                resolve(result);
            }).catch(error => {
                console.log(error);
                reject(error);

            })
    })
}

module.exports = mongoose.model('Live', liveSchema)
