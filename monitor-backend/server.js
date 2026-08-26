// calling the express module
const express = require('express');
// creating an express app
const app = express();
// defining a route handler and checking the health of the server
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});
// starting the server and listening on port 4000
app.listen(4000, () => {console.log("Server is running on port 4000")});