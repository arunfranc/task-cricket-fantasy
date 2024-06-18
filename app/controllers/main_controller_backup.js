const { MongoClient } = require('mongodb');

let db;

async function initializeDb() {
  if (!db) {
    const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('task-cricket');
    console.log('Database connection established');
  }
}

async function listCollections() {
  await initializeDb();
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections);
}

const PlayersModel = require("../models/players");
const PointsModel = require("../models/points");
const MatchModel = require("../models/match");
const TeamModel = require("../models/team");
const MaidenModel = require("../models/maiden");
var ObjectId = require('mongodb').ObjectId;
// console.log(PlayModel);
// Get all players
exports.GetPlayers = async (req, res) => {
    // console.log("hi");
    try {
        const players = await PlayersModel.find();
        res.json(players); 
    } catch (error) {
        // console.log(error);
        return res.status(500).json({ error: 'An error occurred while fetching players' });
    }
}; 

exports.AddTeam = async(req,res) => {
    const team = req.body;
    if(team.Players=="" || team.TeamName=="" || team.Captain=="" || team.ViceCaptain==""){
        return res.status(400).send({ error: 'Give the required fields' });
    }else{
        if(team.Players.length != 11){
            return res.status(400).send({ error: 'Choose 11 players' });
        }
        // const total_players = this.GetPlayers;
        const player_type = await PlayersModel.find({ Player: { $in: team.Players } }); 
        const playerRole =[];
        player_type.forEach((user, index) => {
            // console.log(`${index} - `, user.Role)
            var role = user.Role;
            const playerTypeArr = {
                role : user.Role
            }
            playerRole.push(role);
        });
        var bat = playerRole.filter(x => x === "BATTER").length;
        var wk = playerRole.filter(x => x === "WICKETKEEPER").length;
        var ar = playerRole.filter(x => x === "ALL-ROUNDER").length;
        var bwl = playerRole.filter(x => x === "BOWLER").length;
        if((bat>=1 && bat<=8) && (wk>=1 && wk<=8) && (ar>=1 && ar<=8) && (bwl>=1 && bwl<=8)){
            if(team.Players.includes(team.Captain)!==true || team.Players.includes(team.ViceCaptain)!==true){
                return res.status(400).send({ error: 'Choose captain & vc in the selected team' });
            }else{
                const playersIns = {"team_name":team.TeamName,"players":team.Players,"captain":team.Captain,"vice_captain":team.ViceCaptain};
                const playersInsert = await TeamModel.insertMany([playersIns]);
                if(playersInsert){
                    res.status(200).send({ success: 'Team Created' });
                }
            }
        }else{
            return res.status(400).send({ error: 'Choose players within the range' });
        }
    }
    
};

async function maidenResult(data){
    const maiden = await MaidenModel.aggregate([
        { $match: { 'bowler': data.bowler } },
        { $group: {"_id": {over: "$over" ,inning: "$innings",bowler:"$bowler"},count: { $sum: 1 }}}
    ]);
    if(maiden){
        return maiden.length;
    }else{
        return 0;
    }
}

// exports.MaidenResult = async(data) => {    
//     const maiden = await MaidenModel.aggregate([
//         { $match: { 'bowler': data.bowler } },
//         { $group: {"_id": {over: "$over" ,inning: "$innings",bowler:"$bowler"},count: { $sum: 1 }}}
//     ]);
//     if(maiden){
//         return maiden.length;
//     }else{
//         return 0;
//     }
// };

async function processResult(){
    const match = await MatchModel.find();
    const teams = await TeamModel.find();
    // console.log(players[0].players);return;
    var final_batter = [];
    var final_bowler = [];
    var final_maiden = [];
    var final_fielder = [];
    // teams.forEach(async(team) => {
    for(let team of teams){
        // team.players.forEach( (player) => {
        for(let player of team.players){
            // console.log(player);return;
            var batter = [];
            var bowler = [];
            var fielder = [];
            var i=0;var j=0,w=0,l=0; var c=0;
            var caughtCnt=0;var runoutCnt=0;var stumpingCnt=0;
            // match.forEach( async (ball) => {
            for(let ball of match){
                if(player === ball.batter){
                    var batterArr = new Array();
                    if(ball.batsman_run===4){                        
                        var boundaryCnt = i+1;
                        // console.log(boundaryCnt);
                    }else{
                        boundaryCnt = 0;
                    }
                    if(ball.batsman_run===6){                        
                        var maxCnt = j+1;
                        // console.log(boundaryCnt);
                    }else{
                        maxCnt = 0;
                    }
                    batterArr = {"team":team.team_name,"runs":ball.batsman_run,"name":ball.batter,"boundary":boundaryCnt,"max":maxCnt};
                    // console.log(batterArr);
                    batter.push(batterArr);
                }
                if(player === ball.bowler){
                    var bowlerArr = new Array();
                    if(ball.isWicketDelivery===1 && ball.kind!="run out"){
                        var wicketCnt = w+1;
                    }else{
                        wicketCnt=0;
                    }
                    if(ball.isWicketDelivery===1 && ball.kind==="caught and bowled"){                            
                        var catchCnt = c+1;
                    }else{
                        catchCnt=0;
                    }
                    if((ball.isWicketDelivery===1 && ball.kind==="lbw") || (ball.isWicketDelivery===1 && ball.kind==="bowled")){
                        var lbCnt = l+1;
                    }else{
                        lbCnt=0;
                    }
                    var innings = ball.innings;var overs = ball.overs;var bowler_current = ball.bowler;
                    const maiden = await MatchModel.find({innings: { $in: innings },overs: {$in: overs},bowler: {$in: bowler_current}});
                    // console.log(maiden);
                    var total_runs = 0;
                    for(var x=0, n=maiden.length; x < n; x++) 
                    { 
                        total_runs += maiden[x].total_run;
                        var bowler_details = {bowler: maiden[i].bowler,over: maiden[i].overs,innings: maiden[i].innings};
                        // console.log(match[i].bowler+','+match[i].overs+','+match[i].innings); 
                    }
                    if(x>=6 && total_runs===0){
                        const maidenInsert = await MaidenModel.insertMany([bowler_details]);
                    }
                    bowlerArr = {"team":team.team_name,"name":ball.bowler,"wicket":wicketCnt,"l_b":lbCnt,"catch_bowl":catchCnt};
                    bowler.push(bowlerArr);                        
                }                    
            // });
                if(player === ball.fielders_involved){
                    var fielderArr = new Array();
                    if(ball.isWicketDelivery===1 && ball.kind==="caught"){
                        caughtCnt = caughtCnt+1;
                    }else{
                        caughtCnt=0;
                    }
                    if(ball.isWicketDelivery===1 && ball.kind==="run out"){
                        runoutCnt = runoutCnt+1;
                    }else{
                        runoutCnt=0;
                    }
                    if(ball.isWicketDelivery===1 && ball.kind==="stumping"){
                        stumpingCnt = stumpingCnt+1;
                    }else{
                        stumpingCnt=0;
                    }
                    fielderArr = {"team":team.team_name,"name":ball.fielders_involved,"caught":caughtCnt,"run_out":runoutCnt,"stumping":stumpingCnt};
                    fielder.push(fielderArr);  
                    // console.log(fielderArr);                      
                }                
            }
            const inputMaiden = {bowler:player};
            var maiden_results = [];                
            // await this.MaidenResult(inputMaiden).then(function(result){                
            //     var maiden_overs = {"team":team.team_name,"name":player,"maiden": result};                                 
            //     maiden_results.push(maiden_overs);
            // });
            var maiden_func = await maidenResult(inputMaiden);
            var maiden_overs = {"team":team.team_name,"name":player,"maiden": maiden_func};
            maiden_results.push(maiden_overs);
            final_maiden.push(maiden_results);
            // console.log(maiden_func);
            final_batter.push(batter);
            final_bowler.push(bowler);
            final_fielder.push(fielder);
            await MaidenModel.deleteMany({});
        //});
        }
    }
    // });
    // return maiden_results;
    // console.log(final_maiden);
    const points = await PointsModel.find({});
    // console.log(points[0].run_bonus);
    //Batsman
    var results_batter = [];
    final_batter.forEach((value) => {
        // console.log(value);
        var results = {};
        value.reduce(function(r, o) {
            var key = o.team + '-' + o.name;
            
            if(!results[key]) {
                results[key] = Object.assign({}, o); // create a copy of o
                r.push(results[key]);
            } else {
                results[key].runs += o.runs;
                results[key].boundary += o.boundary;
                results[key].max += o.max;
            }
            
            return r;
            }, []);
        //   results.filter(e => e.length);
        //   res.json(result);
        results_batter.push(results);
        // console.log(result)
    });
    var results_batter =  results_batter.filter(value => Object.keys(value).length !== 0);
    
    // res.json(results_batter);
    
    //Bowler
    var results_bowler = [];
    final_bowler.forEach((value) => {
        // console.log(value);
        var results1 = {};
        value.reduce(function(r, o) {
            var key1 = o.team + '-' + o.name;
            
            if(!results1[key1]) {
                results1[key1] = Object.assign({}, o); // create a copy of o
                r.push(results1[key1]);
            } else {
                results1[key1].wicket += o.wicket;
                results1[key1].l_b += o.l_b;
                results1[key1].catch_bowl += o.catch_bowl;
            }
            
            return r;
            }, []);
        //   res.json(result);
        results_bowler.push(results1);
        // console.log(result)
    });
    var results_bowler =  results_bowler.filter(value => Object.keys(value).length !== 0);
    // res.json(results_bowler);

    //Maiden
    var results_maiden = [];
    final_maiden.forEach((value) => {
        // console.log(value);
        var results2 = {};
        value.reduce(function(r, o) {
            var key = o.team + '-' + o.name;                
            if(!results2[key]) {
                results2[key] = Object.assign({}, o); // create a copy of o
                r.push(results2[key]);
            } else {
                results2[key].maiden += o.maiden;
            }              
            return r;
            }, []);
        results_maiden.push(results2);
    });
    var results_maiden =  results_maiden.filter(value => Object.keys(value).length !== 0);

    //Fielder
    var results_fielder = [];
    final_fielder.forEach((value) => {
        // console.log(value);
        var results3 = {};
        value.reduce(function(r, o) {
            var key = o.team + '-' + o.name;
            
            if(!results3[key]) {
                results3[key] = Object.assign({}, o); // create a copy of o
                r.push(results3[key]);
            } else {
                results3[key].runs += o.runs;
                results3[key].boundary += o.boundary;
                results3[key].max += o.max;
            }
            
            return r;
            }, []);
        //   results.filter(e => e.length);
        //   res.json(result);
        results_fielder.push(results3);
        // console.log(result)
    });
    var results_fielder =  results_fielder.filter(value => Object.keys(value).length !== 0);
    // res.json(results_bowler);
    //Batting Points
    var battingpointsArr = [];
    for(let batting of results_batter){
        const batterKey = Object.keys(batting)[0];
        const batterDetails = batting[batterKey];
        var captainCheck = await TeamModel.find({team_name:batterDetails.team,captain:batterDetails.name});
        var multiplier=1;
        if(captainCheck.length!==0){
            multiplier = 2;
        }
        var vicecaptainCheck = await TeamModel.find({team_name:batterDetails.team,vice_captain:batterDetails.name});
        if(vicecaptainCheck.length!==0){
            multiplier = 1.5;
        }
        var run_bonus = batterDetails.runs * points[0].run_bonus * multiplier;
        var boundary_bonus = batterDetails.boundary * points[0].boundary_bonus * multiplier;
        var six_bonus = batterDetails.max * points[0].six_bonus * multiplier;
        var batting_bonus = run_bonus+boundary_bonus+six_bonus; 
        if(batterDetails.runs>=50 && batterDetails.runs<100){
            batting_bonus = batting_bonus+points[0].fifty_bonus * multiplier;
        }  
        if(batterDetails.runs>=30 && batterDetails.runs<50){
            batting_bonus = batting_bonus+points[0].thirty_bonus * multiplier;
        } 
        if(batterDetails.runs>=100){
            batting_bonus = batting_bonus+points[0].century_bonus * multiplier;
        } 
        var typeCheck = await PlayersModel.find({Player: batterDetails.name});
        if((typeCheck[0].Role==="Batter" || batterDetails.runs===0)  && (typeCheck[0].Role==="ALL-ROUNDER" || batterDetails.runs===0) && (typeCheck[0].Role==="WICKETKEEPER" || batterDetails.runs===0)){
            // if(batterDetails.runs==0){
                batting_bonus = batting_bonus - 2;
            // }               
        }
                
        var batting_points = {"team":batterDetails.team,"name":batterDetails.name,"points":batting_bonus}
        // console.log(batterDetails.runs);
        battingpointsArr.push(batting_points);
    }
    // return;
    //Bowling Points
    var bowlingpointsArr = [];
    for(let bowling of results_bowler){
        const bowlerKey = Object.keys(bowling)[0];
        const bowlerDetails = bowling[bowlerKey];
        var captainCheck = await TeamModel.find({team_name:bowlerDetails.team,captain:bowlerDetails.name});
        var multiplier=1;
        if(captainCheck.length!==0){
            multiplier = 2;
        }
        var vicecaptainCheck = await TeamModel.find({team_name:bowlerDetails.team,vice_captain:bowlerDetails.name});
        if(vicecaptainCheck.length!==0){
            multiplier = 1.5;
        }
        var wicket_bonus = bowlerDetails.wicket * points[0].wicket * multiplier;
        var lb_bonus = bowlerDetails.l_b * points[0].lbw_bowled * multiplier;
        var catch_bonus = bowlerDetails.catch_bowl * points[0].catch * multiplier;
        var bowling_bonus = wicket_bonus+lb_bonus+catch_bonus;
        if(bowlerDetails.wicket==3){
            bowling_bonus = bowling_bonus+points[0].three_wicket * multiplier;
        }  
        if(bowlerDetails.wicket==4){
            bowling_bonus = bowling_bonus+points[0].four_wicket * multiplier;
        } 
        if(bowlerDetails.wicket>=5){
            bowling_bonus = bowling_bonus+points[0].five_wicket * multiplier;
        }
        var bowling_points = {"team":bowlerDetails.team,"name":bowlerDetails.name,"points":bowling_bonus}
        bowlingpointsArr.push(bowling_points);
    }

    //Maiden Points
    var maidenpointsArr = [];
    for(let maiden of results_maiden){
        const maidenKey = Object.keys(maiden)[0];
       
        const maidenDetails = maiden[maidenKey];
        // console.log(maidenDetails);
        var captainCheck = await TeamModel.find({team_name:maidenDetails.team,captain:maidenDetails.name});
        var multiplier=1;
        if(captainCheck.length!==0){
            multiplier = 2;
        }
        var vicecaptainCheck = await TeamModel.find({team_name:maidenDetails.team,vice_captain:maidenDetails.name});
        if(vicecaptainCheck.length!==0){
            multiplier = 1.5;
        }
        var maiden_bonus = maidenDetails.maiden * points[0].maiden * multiplier;           
        var maiden_points = {"team":maidenDetails.team,"name":maidenDetails.name,"points":maiden_bonus}
        maidenpointsArr.push(maiden_points);
    }

    //Fielding Points
    var fieldingpointsArr = [];
    for(let fielding of results_fielder){
        const fielderKey = Object.keys(fielding)[0];
        const fielderDetails = fielding[fielderKey];
        var captainCheck = await TeamModel.find({team_name:fielderDetails.team,captain:fielderDetails.name});
        var multiplier=1;
        if(captainCheck.length!==0){
            multiplier = 2;
        }
        var vicecaptainCheck = await TeamModel.find({team_name:fielderDetails.team,vice_captain:fielderDetails.name});
        if(vicecaptainCheck.length!==0){
            multiplier = 1.5;
        }
        var catch_bonus = fielderDetails.caught * points[0].catch * multiplier;
        var runout_bonus = fielderDetails.run_out * points[0].run_out * multiplier;
        var stumping_bonus = fielderDetails.stumping * points[0].stumping * multiplier;
        var fielding_bonus = catch_bonus+runout_bonus+stumping_bonus;
        if(fielderDetails.caught>=3){
            fielding_bonus = fielding_bonus+points[0].three_catch * multiplier;
        }
        var fielding_points = {"team":fielderDetails.team,"name":fielderDetails.name,"points":fielding_bonus}
        fieldingpointsArr.push(fielding_points);
    }

    var finalpointsArr = [];
    const final_points = finalpointsArr.concat(battingpointsArr,bowlingpointsArr,maidenpointsArr,fieldingpointsArr);
    // this.TeamResult(final_points);
    var results_points = [];
    var results4 = {};
    final_points.reduce(function(r, o) {
        var key = o.team + '-' + o.name;                
        if(!results4[key]) {
            results4[key] = Object.assign({}, o); // create a copy of o
            r.push(results4[key]);
        } else {
            results4[key].points += o.points;
        }              
        return r;
    }, []);
    results_points.push(results4);
    var results_points =  results_points.filter(value => Object.keys(value).length !== 0);
    // res.json(results_points);
    // console.log(results_points);
    return results_points;
}

exports.ProcessResult = async(req,res) => {
    const process = await processResult();
    // console.log(process);
    res.json(process);
};

async function teamResult(){
    const process = await processResult();
    var team_points = {};
    for (const key in process[0]) {
        const player = process[0][key];
        const team = player.team;
        const points = player.points;        
        if (!team_points[team]) {
            team_points[team] = 0;
        }
        team_points[team] += points;
    }
    return team_points;
}

exports.TeamResult = async(req,res) => {
    const team_result = await teamResult();
    let maxPoints = -Infinity;
    let maxTeams = [];
    for (const team in team_result) {
        if (team_result[team] > maxPoints) {
        maxPoints = team_result[team];
        maxTeams = [team];
        } else if (team_result[team] === maxPoints) {
        maxTeams.push(team);
        }
    }
    const winning_team = maxTeams.join(', ');
    // console.log('Team(s) with the greatest points:', maxTeams.join(', '));
    res.json({"Team Points":team_result,"Winning Team": maxTeams.join(', ')});
};
// exports.ProcessResult = async(req,res) => {
//     try {
//         const match = await MatchModel.find();
//         const teams = await TeamModel.find();
//         // console.log(players[0].players);return;
//         var final_batter = [];
//         var final_bowler = [];
//         var final_maiden = [];
//         var final_fielder = [];
//         // teams.forEach(async(team) => {
//         for(let team of teams){
//             // team.players.forEach( (player) => {
//             for(let player of team.players){
//                 // console.log(player);return;
//                 var batter = [];
//                 var bowler = [];
//                 var fielder = [];
//                 var i=0;var j=0,w=0,l=0; var c=0;
//                 var caughtCnt=0;var runoutCnt=0;var stumpingCnt=0;
//                 // match.forEach( async (ball) => {
//                 for(let ball of match){
//                     if(player === ball.batter){
//                         var batterArr = new Array();
//                         if(ball.batsman_run===4){                        
//                             var boundaryCnt = i+1;
//                             // console.log(boundaryCnt);
//                         }else{
//                             boundaryCnt = 0;
//                         }
//                         if(ball.batsman_run===6){                        
//                             var maxCnt = j+1;
//                             // console.log(boundaryCnt);
//                         }else{
//                             maxCnt = 0;
//                         }
//                         batterArr = {"team":team.team_name,"runs":ball.batsman_run,"name":ball.batter,"boundary":boundaryCnt,"max":maxCnt};
//                         // console.log(batterArr);
//                         batter.push(batterArr);
//                     }
//                     if(player === ball.bowler){
//                         var bowlerArr = new Array();
//                         if(ball.isWicketDelivery===1 && ball.kind!="run out"){
//                             var wicketCnt = w+1;
//                         }else{
//                             wicketCnt=0;
//                         }
//                         if(ball.isWicketDelivery===1 && ball.kind==="caught and bowled"){                            
//                             var catchCnt = c+1;
//                         }else{
//                             catchCnt=0;
//                         }
//                         if((ball.isWicketDelivery===1 && ball.kind==="lbw") || (ball.isWicketDelivery===1 && ball.kind==="bowled")){
//                             var lbCnt = l+1;
//                         }else{
//                             lbCnt=0;
//                         }
//                         var innings = ball.innings;var overs = ball.overs;var bowler_current = ball.bowler;
//                         const maiden = await MatchModel.find({innings: { $in: innings },overs: {$in: overs},bowler: {$in: bowler_current}});
//                         // console.log(maiden);
//                         var total_runs = 0;
//                         for(var x=0, n=maiden.length; x < n; x++) 
//                         { 
//                             total_runs += maiden[x].total_run;
//                             var bowler_details = {bowler: maiden[i].bowler,over: maiden[i].overs,innings: maiden[i].innings};
//                             // console.log(match[i].bowler+','+match[i].overs+','+match[i].innings); 
//                         }
//                         if(x>=6 && total_runs===0){
//                             const maidenInsert = await MaidenModel.insertMany([bowler_details]);
//                         }
//                         bowlerArr = {"team":team.team_name,"name":ball.bowler,"wicket":wicketCnt,"l_b":lbCnt,"catch_bowl":catchCnt};
//                         bowler.push(bowlerArr);                        
//                     }                    
//                 // });
//                     if(player === ball.fielders_involved){
//                         var fielderArr = new Array();
//                         if(ball.isWicketDelivery===1 && ball.kind==="caught"){
//                             caughtCnt = caughtCnt+1;
//                         }else{
//                             caughtCnt=0;
//                         }
//                         if(ball.isWicketDelivery===1 && ball.kind==="run out"){
//                             runoutCnt = runoutCnt+1;
//                         }else{
//                             runoutCnt=0;
//                         }
//                         if(ball.isWicketDelivery===1 && ball.kind==="stumping"){
//                             stumpingCnt = stumpingCnt+1;
//                         }else{
//                             stumpingCnt=0;
//                         }
//                         fielderArr = {"team":team.team_name,"name":ball.fielders_involved,"caught":caughtCnt,"run_out":runoutCnt,"stumping":stumpingCnt};
//                         fielder.push(fielderArr);  
//                         // console.log(fielderArr);                      
//                     }                
//                 }
//                 const inputMaiden = {bowler:player};
//                 var maiden_results = [];                
//                 await this.MaidenResult(inputMaiden).then(function(result){                
//                     var maiden_overs = {"team":team.team_name,"name":player,"maiden": result};                                 
//                     maiden_results.push(maiden_overs);
//                 });
//                 final_maiden.push(maiden_results);
//                 // console.log(final_maiden);
//                 final_batter.push(batter);
//                 final_bowler.push(bowler);
//                 final_fielder.push(fielder);
//                 await MaidenModel.deleteMany({});
//             //});
//             }
//         }
//         // });
//         // res.json(final_fielder);
//         // console.log(final_maiden);
//         const points = await PointsModel.find({});
//         // console.log(points[0].run_bonus);
//         //Batsman
//         var results_batter = [];
//         final_batter.forEach((value) => {
//             // console.log(value);
//             var results = {};
//             value.reduce(function(r, o) {
//                 var key = o.team + '-' + o.name;
                
//                 if(!results[key]) {
//                     results[key] = Object.assign({}, o); // create a copy of o
//                   r.push(results[key]);
//                 } else {
//                     results[key].runs += o.runs;
//                     results[key].boundary += o.boundary;
//                     results[key].max += o.max;
//                 }
              
//                 return r;
//               }, []);
//             //   results.filter(e => e.length);
//             //   res.json(result);
//             results_batter.push(results);
//             // console.log(result)
//         });
//         var results_batter =  results_batter.filter(value => Object.keys(value).length !== 0);
        
//         // res.json(results_batter);
        
//         //Bowler
//         var results_bowler = [];
//         final_bowler.forEach((value) => {
//             // console.log(value);
//             var results1 = {};
//             value.reduce(function(r, o) {
//                 var key1 = o.team + '-' + o.name;
                
//                 if(!results1[key1]) {
//                     results1[key1] = Object.assign({}, o); // create a copy of o
//                   r.push(results1[key1]);
//                 } else {
//                     results1[key1].wicket += o.wicket;
//                     results1[key1].l_b += o.l_b;
//                     results1[key1].catch_bowl += o.catch_bowl;
//                 }
              
//                 return r;
//               }, []);
//             //   res.json(result);
//             results_bowler.push(results1);
//             // console.log(result)
//         });
//         var results_bowler =  results_bowler.filter(value => Object.keys(value).length !== 0);
//         // res.json(results_bowler);

//         //Maiden
//         var results_maiden = [];
//         final_maiden.forEach((value) => {
//             // console.log(value);
//             var results2 = {};
//             value.reduce(function(r, o) {
//                 var key = o.team + '-' + o.name;                
//                 if(!results2[key]) {
//                     results2[key] = Object.assign({}, o); // create a copy of o
//                   r.push(results2[key]);
//                 } else {
//                     results2[key].maiden += o.maiden;
//                 }              
//                 return r;
//               }, []);
//             results_maiden.push(results2);
//         });
//         var results_maiden =  results_maiden.filter(value => Object.keys(value).length !== 0);

//         //Fielder
//         var results_fielder = [];
//         final_fielder.forEach((value) => {
//             // console.log(value);
//             var results3 = {};
//             value.reduce(function(r, o) {
//                 var key = o.team + '-' + o.name;
                
//                 if(!results3[key]) {
//                     results3[key] = Object.assign({}, o); // create a copy of o
//                   r.push(results3[key]);
//                 } else {
//                     results3[key].runs += o.runs;
//                     results3[key].boundary += o.boundary;
//                     results3[key].max += o.max;
//                 }
              
//                 return r;
//               }, []);
//             //   results.filter(e => e.length);
//             //   res.json(result);
//             results_fielder.push(results3);
//             // console.log(result)
//         });
//         var results_fielder =  results_fielder.filter(value => Object.keys(value).length !== 0);
//         // res.json(results_bowler);
//         //Batting Points
//         var battingpointsArr = [];
//         for(let batting of results_batter){
//             const batterKey = Object.keys(batting)[0];
//             const batterDetails = batting[batterKey];
//             var captainCheck = await TeamModel.find({team_name:batterDetails.team,captain:batterDetails.name});
//             var multiplier=1;
//             if(captainCheck.length!==0){
//                 multiplier = 2;
//             }
//             var vicecaptainCheck = await TeamModel.find({team_name:batterDetails.team,vice_captain:batterDetails.name});
//             if(vicecaptainCheck.length!==0){
//                 multiplier = 1.5;
//             }
//             var run_bonus = batterDetails.runs * points[0].run_bonus * multiplier;
//             var boundary_bonus = batterDetails.boundary * points[0].boundary_bonus * multiplier;
//             var six_bonus = batterDetails.max * points[0].six_bonus * multiplier;
//             var batting_bonus = run_bonus+boundary_bonus+six_bonus; 
//             if(batterDetails.runs>=50 && batterDetails.runs<100){
//                 batting_bonus = batting_bonus+points[0].fifty_bonus * multiplier;
//             }  
//             if(batterDetails.runs>=30 && batterDetails.runs<50){
//                 batting_bonus = batting_bonus+points[0].thirty_bonus * multiplier;
//             } 
//             if(batterDetails.runs>=100){
//                 batting_bonus = batting_bonus+points[0].century_bonus * multiplier;
//             } 
//             var typeCheck = await PlayersModel.find({Player: batterDetails.name});
//             if((typeCheck[0].Role==="Batter" || batterDetails.runs===0)  && (typeCheck[0].Role==="ALL-ROUNDER" || batterDetails.runs===0) && (typeCheck[0].Role==="WICKETKEEPER" || batterDetails.runs===0)){
//                 // if(batterDetails.runs==0){
//                     batting_bonus = batting_bonus - 2;
//                 // }               
//             }
                   
//             var batting_points = {"team":batterDetails.team,"name":batterDetails.name,"points":batting_bonus}
//             // console.log(batterDetails.runs);
//             battingpointsArr.push(batting_points);
//         }
//         // return;
//         //Bowling Points
//         var bowlingpointsArr = [];
//         for(let bowling of results_bowler){
//             const bowlerKey = Object.keys(bowling)[0];
//             const bowlerDetails = bowling[bowlerKey];
//             var captainCheck = await TeamModel.find({team_name:bowlerDetails.team,captain:bowlerDetails.name});
//             var multiplier=1;
//             if(captainCheck.length!==0){
//                 multiplier = 2;
//             }
//             var vicecaptainCheck = await TeamModel.find({team_name:bowlerDetails.team,vice_captain:bowlerDetails.name});
//             if(vicecaptainCheck.length!==0){
//                 multiplier = 1.5;
//             }
//             var wicket_bonus = bowlerDetails.wicket * points[0].wicket * multiplier;
//             var lb_bonus = bowlerDetails.l_b * points[0].lbw_bowled * multiplier;
//             var catch_bonus = bowlerDetails.catch_bowl * points[0].catch * multiplier;
//             var bowling_bonus = wicket_bonus+lb_bonus+catch_bonus;
//             if(bowlerDetails.wicket==3){
//                 bowling_bonus = bowling_bonus+points[0].three_wicket * multiplier;
//             }  
//             if(bowlerDetails.wicket==4){
//                 bowling_bonus = bowling_bonus+points[0].four_wicket * multiplier;
//             } 
//             if(bowlerDetails.wicket>=5){
//                 bowling_bonus = bowling_bonus+points[0].five_wicket * multiplier;
//             }
//             var bowling_points = {"team":bowlerDetails.team,"name":bowlerDetails.name,"points":bowling_bonus}
//             bowlingpointsArr.push(bowling_points);
//         }

//         //Maiden Points
//         var maidenpointsArr = [];
//         for(let maiden of results_maiden){
//             const maidenKey = Object.keys(maiden)[0];
//             const maidenDetails = maiden[maidenKey];
//             var captainCheck = await TeamModel.find({team_name:maidenDetails.team,captain:maidenDetails.name});
//             var multiplier=1;
//             if(captainCheck.length!==0){
//                 multiplier = 2;
//             }
//             var vicecaptainCheck = await TeamModel.find({team_name:maidenDetails.team,vice_captain:maidenDetails.name});
//             if(vicecaptainCheck.length!==0){
//                 multiplier = 1.5;
//             }
//             var maiden_bonus = maidenDetails.maiden * points[0].maiden * multiplier;           
//             var maiden_points = {"team":maidenDetails.team,"name":maidenDetails.name,"points":maiden_bonus}
//             maidenpointsArr.push(maiden_points);
//         }

//         //Fielding Points
//         var fieldingpointsArr = [];
//         for(let fielding of results_fielder){
//             const fielderKey = Object.keys(fielding)[0];
//             const fielderDetails = fielding[fielderKey];
//             var captainCheck = await TeamModel.find({team_name:fielderDetails.team,captain:fielderDetails.name});
//             var multiplier=1;
//             if(captainCheck.length!==0){
//                 multiplier = 2;
//             }
//             var vicecaptainCheck = await TeamModel.find({team_name:fielderDetails.team,vice_captain:fielderDetails.name});
//             if(vicecaptainCheck.length!==0){
//                 multiplier = 1.5;
//             }
//             var catch_bonus = fielderDetails.caught * points[0].catch * multiplier;
//             var runout_bonus = fielderDetails.run_out * points[0].run_out * multiplier;
//             var stumping_bonus = fielderDetails.stumping * points[0].stumping * multiplier;
//             var fielding_bonus = catch_bonus+runout_bonus+stumping_bonus;
//             if(fielderDetails.caught>=3){
//                 fielding_bonus = fielding_bonus+points[0].three_catch * multiplier;
//             }
//             var fielding_points = {"team":fielderDetails.team,"name":fielderDetails.name,"points":fielding_bonus}
//             fieldingpointsArr.push(fielding_points);
//         }

//         var finalpointsArr = [];
//         const final_points = finalpointsArr.concat(battingpointsArr,bowlingpointsArr,maidenpointsArr,fieldingpointsArr);
//         // this.TeamResult(final_points);
//         var results_points = [];
//         var results4 = {};
//         final_points.reduce(function(r, o) {
//             var key = o.team + '-' + o.name;                
//             if(!results4[key]) {
//                 results4[key] = Object.assign({}, o); // create a copy of o
//                 r.push(results4[key]);
//             } else {
//                 results4[key].points += o.points;
//             }              
//             return r;
//         }, []);
//         results_points.push(results4);
//         var results_points =  results_points.filter(value => Object.keys(value).length !== 0);
//         res.json(results_points);
//         // return results_points;
//         // res.json(results_bowler);
//         // Object.keys(final_batter).forEach(function(arrayToInspect) {
//         //     final_batter[arrayToInspect].forEach(function(element) {
//         //       if (results[element.name]) {
//         //         results[element.name].runs += element.runs;
//         //         results[element.name].boundary += element.boundary;
//         //         results[element.name].max += element.max;
//         //       }
//         //       else {
//         //         results[element.name] = element;
//         //       }
//         //     });
//         // });
//         // var resultsBowler = {};
//         // Object.keys(final_bowler).forEach(function(arrayToInspect1) {
//         //     final_bowler[arrayToInspect1].forEach(function(element_bowler) {
//         //     if (resultsBowler[element_bowler.name]) {
//         //         resultsBowler[element_bowler.name].wicket += element_bowler.wicket;
//         //         resultsBowler[element_bowler.name].l_b += element_bowler.l_b;
//         //         // resultsBowler[element_bowler.name].max += element_bowler.max;
//         //     }
//         //     else {
//         //         resultsBowler[element_bowler.name] = element_bowler;
//         //     }
//         //     });
//         // });
            
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: 'An error occurred while fetching match' });
//     }
// };


