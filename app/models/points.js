const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
    run_bonus: {
        type: Number,
    },
    boundary_bonus: {
        type: Number,
    },
    six_bonus: {
        type: Number,
    },
    thirty_bonus: {
        type: Number,
    },
    fifty_bonus: {
        type: Number,
    },
    century_bonus: {
        type: Number,
    },
    duck_dismissal: {
        type: Number,
    },
    wicket: {
        type: Number,
    },
    lbw_bowled: {
        type: Number,
    },
    three_wicket: {
        type: Number,
    },
    four_wicket: {
        type: Number,
    },
    five_wicket: {
        type: Number,
    },
    maiden: {
        type: Number,
    },
    catch: {
        type: Number,
    },
    three_catch: {
        type: Number,
    },
    run_out: {
        type: Number,
    },
    stumping: {
        type: Number,
    }
},{
    timestamps: false
})

const Points = mongoose.model('Points', pointsSchema);


module.exports = Points; 