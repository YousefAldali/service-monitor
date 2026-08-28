const express = require('express');      // calling the express module
const config = require('./config.json'); // calling the config.json file 
const app = express();                  // creating an express app
const cors = require('cors');                 
app.use(cors());                          // enable CORS for all routes 
// this is needed because the frontend and backend are on different ports (3000 and 4000)
// this allows the frontend to make requests to the backend without being blocked by the browser's same-origin policy

let latestResults = [];
let history = {};

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});



async function checkService(service) {     // async because we are using await inside the function
    const start = Date.now();     // record the start time of the request
  try {   // try if anything goes wrong with the fetch request it will be caught in the catch block
    const controller = new AbortController();                      // create an abort controller to set a timeout
    const timeout = setTimeout(() => controller.abort(), 10000);   // abort the request after 10 seconds
    const response = await fetch(service.URL, { signal: controller.signal });     // send the request to the service URL and waits for the response
    clearTimeout(timeout);                                         // clear the timeout if the request completes in time
    const responseTime = Date.now() - start;     // calculate the response time by subtracting the start time from the current time
    return {     // build and return the success report 
      name: service.name,
      status: response.ok ? "UP" : "DOWN",  // if the response is ok, UP otherwise it is DOWN
      statusCode: response.status,          // the raw HTTP code (200, 404, etc.).
      responseTime: responseTime,          // the time it took to get a response from the service
      timestamp: new Date().toISOString() // the current time in ISO format
    };
  } 
  catch (error) {  // this runs if the fetch request fails (DOWN)

    const responseTime = Date.now() - start;
    return {
      name: service.name,
      status: "DOWN",
      statusCode: null,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

async function checkAllServices() { // checks all services at once (concurrently)
  const results = await Promise.all(
    config.services.map(service => checkService(service))
  );
  return results;
}

// store the results in the history object, keeping only the last 100 results for each service
function storeResults(results) {
  results.forEach(result => {
    if (!history[result.name]) {
      history[result.name] = [];
    }
    history[result.name].push(result);
    if (history[result.name].length > 100) {
      history[result.name].shift();
    }
  });
}

// run all checks once right away, so we have data on startup
checkAllServices().then(results => {
  latestResults = results;
  storeResults(results); // also store the first batch in history
});

// then run all checks every 30 seconds
setInterval(async () => {
  latestResults = await checkAllServices();
  storeResults(latestResults);
  console.log("Checks updated at", new Date().toISOString());
}, 30000);

// return the most recent stored results (no live checking)
app.get("/status", (req, res) => {
  res.json(latestResults);
});



// return the check history for a single service by name
app.get("/history/:name", (req, res) => {
  const name = req.params.name;
  const serviceHistory = history[name] || [];
  res.json(serviceHistory);
});