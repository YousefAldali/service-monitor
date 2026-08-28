// useState to hold data and useEffect to run code on load
import { useState, useEffect } from "react";
import './App.css';
function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // a function that fetches the status from the backend
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status"); // fetch the status from the backend 
        const data = await response.json();
        setServices(data);
        setError(null);
        setLoading(false);
      } catch (err) { // if the fetch fails, log the error
        console.error("Failed to fetch status:", err);
        setError("Unable to reach the backend server.");
        setLoading(false);
      }
    };

    // fetch once immediately when the page loads
    fetchStatus();

    // then fetch API again every 5 seconds and it auto-refresh
    const interval = setInterval(fetchStatus, 5000);

    // cleanup: stop the timer if the component goes away
    return () => clearInterval(interval);
  }, []);

  // show a loading message while waiting for the first response
  if (loading) {
    return (
      <div className="dashboard">
        <h1>Service Monitor</h1>
        <p className="loading-message">Loading services...</p>
      </div>
    );
  }

  // show an error message if the backend is unreachable
  if (error && services.length === 0) {
    return (
      <div className="dashboard">
        <h1>Service Monitor</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

// render the dashboard with the service status
   return (
    <div className="dashboard">
      <h1>Service Monitor</h1>
      {error && <p className="error-banner">{error}</p>}
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