const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server Running at http://localhost:3003/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// get all the player list
app.get("/players/", async (request, response) => {
  const playerListQuery = `
    SELECT * FROM cricket_team
    ORDER BY player_id`;
  const dbResponse = await db.all(playerListQuery);
  response.send(
    dbResponse.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// post request by add one player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name, jersey_number, role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         ${role}
      );`;
  const dbResponse = await db.run(addPlayerQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to");
});

//get details based on playerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerListQuery = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId}`;
  const dbResponse = await db.get(getPlayerListQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

// update details of player by their id

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetailsQuery = `
    UPDATE 
    cricket_team 
    SET 
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

initializeDBAndServer();

module.exports = app;
