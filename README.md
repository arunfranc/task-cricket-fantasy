# task-cricket-fantasy

## Endpoints

### Add Team Entry "/add-team"
- Input Parameters:
  - Your Team Name (required)
  - Players [] (required, list of player names)
  - Captain (required, player name) 
  - vice-captain (required, player name)

Example(Postman):
{
    "TeamName": "Rockers",
    "Players": ["RD Gaikwad","DP Conway","SV Samson","JC Buttler","AT Rayudu","MS Dhoni","MJ Santner","R Ashwin","Navdeep Saini","Ravindra Jadeja","M Prasidh Krishna"],
    "Captain": "SV Samson",
    "ViceCaptain" : "MS Dhoni"
}


### Process Match Result "/process-result"
  - Input Parameters:
    - None
  - Output(Postman)
     - Showing players total points.


### View Teams Results "/team-result"
  - Input Parameters:
    - None
  - Output(Postman)
    - Showing Teamwise points and highest points won team 
  
