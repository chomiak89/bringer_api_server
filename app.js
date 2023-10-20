require("dotenv/config");

const express = require("express");
const { header } = require("express/lib/request");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cors = require("cors");

const app = express();

// ℹ️ set up cross origin resource sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

// ℹ️ setup body parser
app.use(express.json({ limit: "50mb" }));

//ROOT ROUTE
app.get("/home", (req, res, next) => {
  console.log(req);
  res.send("<h1>Hit that route</h1>");
});

//----------------------------------------------------------------------------
// 🔀 GENERATE_TOKEN ROUTE
//----------------------------------------------------------------------------
app.post("/generate_token", (req, res) => {
  const { username, password } = req.body;

  //make sure we have the username and password
  if (!username || !password) {
    res.json({ error: "username and password required" });
  }

  //******
  //   ❕ additionally
  //   some logic to check the username and pass in the server would go here
  //   also decrypting logic, and wrong info error response logic
  //******

  //create username and pass payload
  const payload = {
    username: username,
    password: password,
  };

  //build the jwt token
  const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "6h",
  });

  //send back the jwt token
  res.send({ message: authToken });
});

//----------------------------------------------------------------------------
// 🔀 TRACKING_PARCEL ROUTE
//----------------------------------------------------------------------------
app.get("/tracking_parcel", async (req, res) => {
  const tracking_number = req.query.tracking;

  //config header with bearer token for the 3rd party api authorization
  const config = {
    headers: {
      Authorization: `Bearer{${process.env.API_AUTH_TOKEN}}`,
    },
  };

  //make a call to get the data from the api, then send data to client
  await axios
    .get(
      `https://bps.bringer.io/public/api/v2/get/parcel/tracking.json?tracking_number=${tracking_number}`,
      config
    )
    .then((apiresponse) => {
      res.send(apiresponse.data);
    })
    .catch((err) => console.log(err));
});

//START SERVER
app.listen(3001, () => {
  console.log("app listening on port 3001");
});
