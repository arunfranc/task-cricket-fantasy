const mongoose = require('mongoose');

const maidenSchema = new mongoose.Schema({
    bowler: {
        type: String,
    },
    over: {
        type: Number,
    },
    innings: {
        type: Number,
    }
    // ,
    // maiden_count: {
    //     type: String,
    // }
},{
    timestamps: true
})

const Maiden = mongoose.model('Maiden', maidenSchema);


module.exports = Maiden; 