const express = require('express');
const router = express.Router();
const Maincontroller = require("../controllers/main.controller.js");

//get players list
router.get("/GetPlayers/", Maincontroller.GetPlayers);

//add team endpoint
router.post("/add-team/", Maincontroller.AddTeam);

//result endpoint
router.get("/process-result/", Maincontroller.ProcessResult);

//team result endpoint
router.get("/team-result/", Maincontroller.TeamResult);

module.exports = router;


    