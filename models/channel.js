const mongoose = require('mongoose');


const channelSchema = new mongoose.Schema({
    channelName: {
        type: String,
        required: true,
        trim: true
    },
    channelDescription: {
        type: String,
        required: false
    },
    channelImagePath: {
        type: String,
        required: false,
        default: 'channel image placeholder'
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    streamKey: {
        type: String,
        required: false,

    },
    creatorIds: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },

    adminIds: [

        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    ],

    pinnedVideoId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: false

    },

    channelPlaylist: [
        {

            playlistName: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 30
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

    subscribers: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "User"

        }
    ]
})



channelSchema.statics.getChannel = function (channelId) {
    const vaule = this.model('Channel').where('_id').equals(mongoose.Types.ObjectId(channelId));
    console.log(vaule);
    return vaule
}


channelSchema.statics.getChannelPlaylist = function (channelId) {

    return new Promise((resolve, reject) => {
        this.model('Channel').findById(channelId, 'channelPlaylist').populate('channelPlaylist.VideoIds').then(plyalistResult => {
            resolve(plyalistResult)
        }).catch(error => {
            return reject(error)
        })
    })

}



channelSchema.statics.getChannelSubscribers = function (channelId, callback) {
    this.model('Channel').findById(channelId).then(channel => {
        if (channel) {
            callback(null, channel.subscribers)
        }
    }).catch(error => {
        callback(error, null)
    })
}


channelSchema.statics.isSubscribed = function (channelId, subscriberId, callback) {
    this.model('Channel').findById(channelId).then(channel => {
        if (!channel) {
            callback(true)
        }
        const index = channel.subscribers.findIndex(element => element === subscriberId);
        console.log(index);
        if (index > - 1) {
            callback(true);
        }
        callback(false)
    }).catch(error => callback(error, null))
}




channelSchema.statics.subscribeChannel = function (channelId, subscriberId) {

    return new Promise((resolve, reject) => {
        this.model('Channel').findById(channelId).then(channelResult => {
            if (channelResult && !(channelResult.subscribers.indexOf(subscriberId) >= 0)) {
                channelResult.subscribers = [...channelResult.subscribers, subscriberId]
                return channelResult.save()

            } else {
                const error = new Error('this user already subscribe the channel');
                error.Message = error.message
                error.statusCode = 500;
                throw error
            }
        }).then(result => {
            resolve(result)
        }).catch(error => {
            return reject(error)
        })
    })

}



channelSchema.statics.unsubscribeChannel = function (channelId, subscriberId) {
    return new Promise((resolve, reject) => {
        this.model('Channel').findById(channelId).then(channelResult => {
            console.log('usid', channelResult.subscribers.indexOf(subscriberId));
            if (channelResult && (channelResult.subscribers.indexOf(subscriberId) >= 0)) {
                console.log('we are in')

                const index = channelResult.subscribers.indexOf(subscriberId)
                channelResult.subscribers.splice(index, 1)
                return channelResult.save()

            } else {
                const error = new Error('this user not a member of  the channel');
                error.Message = error.message
                error.statusCode = 500;
                throw error
            }
        }).then(result => {
            resolve('succussfull')
        }).catch(error => {
            return reject(error)
        })
    })


}


channelSchema.statics.removePlaylist = function (channelId, playlistId) {
    return new Promise((resolve, reject) => {
        this.model('Channel').findById(channelId).then(channelResult => {
            if (channelResult) {
                const playlistIndex = channelResult.channelPlaylist.findIndex(playlist => playlist._id.toString() == playlistId.toString())
                if (playlistIndex >= 0) {
                    channelResult.channelPlaylist.splice(playlistIndex, 1);
                    console.log('remove playlist ', channelResult.channelPlaylist)
                    return channelResult.save()

                }
            }
        }).then(saveResult => {
            resolve(channelResult.channelPlaylist)
        }).catch(error => {
            reject(error)
        })
    })
}


channelSchema.statics.addAdmin = function (userId, channelId) {
    return new Promise((resolve, reject) => {

        this.model('Channel').findById(channelId).then(channelResult => {
            if (channelResult.adminIds.indexOf(userId) >= 0) {
                reject('user is already an admin')
            }
            channelResult.adminIds = [...channelResult.adminIds, userId]
            return channelResult.save()
        }).then(saveResult => {
            resolve(saveResult);
        }).catch(error => {
            console.log('error')
            reject(error)
        })
    })
}

channelSchema.statics.removeAdmin = function (userId, channelId) {
    return new Promise((resolve, reject) => {
        console.log('userid', userId)
        this.model('Channel').findById(channelId).then(channel => {
            const index = channel.adminIds.indexOf(userId);
            if (index < 0) {
                const error = new Error('the user in not an admin');
                error.statusCode = 400;
               return  reject(error);
            }
            channel.adminIds.splice(index, 1);
            console.log(channel.adminIds)
            return channel.save()
        }).then(saveResult => {
            resolve(saveResult)
        }).catch(error => {
            reject(error);
        })
    })
}

module.exports = mongoose.model("Channel", channelSchema)