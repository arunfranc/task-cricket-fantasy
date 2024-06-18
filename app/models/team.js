const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    team_name: {
        type: String,
    },
    players: {
        type: Array,
    },
    captain: {
        type: String,
    },
    vice_captain: {
        type: String,
    }
},{
    timestamps: true
})

const Team = mongoose.model('Team', teamSchema);


module.exports = Team; 