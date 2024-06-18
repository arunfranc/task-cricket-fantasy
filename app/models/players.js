const mongoose = require('mongoose');

const playersSchema = new mongoose.Schema({
    Player: {
        type: String,
    },
    Team: {
        type: String,
    },
    Role: {
        type: String,
    }
},{
    timestamps: true
})

const Players = mongoose.model('Players', playersSchema);


module.exports = Players; 