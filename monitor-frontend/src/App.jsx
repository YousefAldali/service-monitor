// useState to hold data and useEffect to run code on load
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import './App.css';

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  // fetch the history for a specific service when a card is clicked
  const handleCardClick = async (serviceName) => {
    // if the same card is clicked again, close the chart
    if (selectedService === serviceName) {
      setSelectedService(null);
      setHistoryData([]);
      return;
    }

    setSelectedService(serviceName);
    setHistoryLoading(true);

    try {
      const response = await fetch(`/api/history/${encodeURIComponent(serviceName)}`);
      const data = await response.json();
      // format the data for the chart: show time on x-axis and response time on y-axis
      const chartData = data.map((entry) => ({
        time: new Date(entry.timestamp).toLocaleTimeString(),
        responseTime: entry.responseTime,
        status: entry.status,
      }));
      setHistoryData(chartData);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setHistoryData([]);
    }

    setHistoryLoading(false);
  };

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

  // filter out the services that are currently down to show an alert banner
  const downServices = services.filter(s => s.status === "DOWN");

  // render the dashboard with the service status
  return (
    <div className="dashboard">
      <h1>Service Monitor</h1>
      {error && <p className="error-banner">{error}</p>}
      {downServices.length > 0 && (
        <div className="alert-banner">
          ⚠ {downServices.length} {downServices.length === 1 ? "service is" : "services are"} down: {downServices.map(s => s.name).join(", ")}
        </div>
      )}
      <div className="cards">
        {services.map((service) => (
          <div key={service.name}>
            <div
              className={`card ${service.status.toLowerCase()} ${selectedService === service.name ? "selected" : ""}`}
              onClick={() => handleCardClick(service.name)}
            >
              <h2>{service.name}</h2>
              <p className="status">{service.status}</p>
              <p>Response time: {service.responseTime} ms</p>
              <p>Status code: {service.statusCode ?? "N/A"}</p>
              <p>Last checked: {new Date(service.timestamp).toLocaleTimeString()}</p>
              <p className="card-hint">Click to {selectedService === service.name ? "hide" : "view"} history</p>
            </div>

            {selectedService === service.name && (
              <div className="chart-panel">
                <h3>Response Time History — {service.name}</h3>
                {historyLoading ? (
                  <p className="loading-message">Loading chart...</p>
                ) : historyData.length === 0 ? (
                  <p className="loading-message">No history yet. Wait for a few check cycles.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis unit=" ms" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "#1e1e1e", border: "1px solid #444", borderRadius: "6px" }}
                        labelStyle={{ color: "#e0e0e0" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: "#22c55e", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// export the App component so it can be used in index.js
export default App;