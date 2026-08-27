// useState to hold data and useEffect to run code on load
import { useState, useEffect } from "react";
import './App.css';
function App() {
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    // a function that fetches the status from the backend
    const fetchStatus = async () => {
      try {
        const response = await fetch("http://localhost:4000/status"); // fetch the status from the backend in defferent port (4000) than the frontend (3000)
        const data = await response.json(); // parse the JSON response
        setServices(data);
      } catch (error) { // if the fetch fails, log the error
        console.error("Failed to fetch status:", error);
      }
    };

    // fetch once immediately when the page loads
    fetchStatus();

    // then fetch API again every 5 seconds and it auto-refresh
    const interval = setInterval(fetchStatus, 5000);

    // cleanup: stop the timer if the component goes away
    return () => clearInterval(interval);
  }, []);
// render the dashboard with the service status
   return (
    <div className="dashboard">
      <h1>Service Monitor</h1>
      <div className="cards">
        {services.map((service) => (
       <div className={`card ${service.status.toLowerCase()}`} key={service.name}>   
               <h2>{service.name}</h2>
            <p className="status">{service.status}</p>
            <p>Response time: {service.responseTime} ms</p>
            <p>Status code: {service.statusCode ?? "N/A"}</p>
            <p>Last checked: {new Date(service.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
// export the App component so it can be used in index.js
export default App;