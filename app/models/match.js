const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    
    innings: {
        type: Number,
    },
    overs: {
        type: Number,
    },
    ballnumber: {
        type: Number,
    },
    batter: {
        type: String,
    },
    bowler: {
        type: String,
    },
    extra_type: {
        type: String,
    },
    batsman_run: {
        type: Number,
    },
    extras_run: {
        type: Number,
    },
    total_run: {
        type: Number,
    },
    non_boundary: {
        type: Number,
    },
    isWicketDelivery: {
        type: Number,
    },
    player_out: {
        type: String,
    },
    kind: {
        type: String,
    },
    fielders_involved: {
        type: String,
    },
    BattingTeam: {
        type: String,
    },
    non_striker: {
        type: String,
    },
    token: {
        type: Number,
    }
},{
    timestamps: true
});

const Match = mongoose.model('Match', matchSchema);


module.exports = Match; 