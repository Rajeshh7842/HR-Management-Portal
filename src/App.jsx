
import { useState, useEffect } from "react";
import Login from "./Login";
import "./css/style.css";

function App() {
  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrEmployees")) || [];
    } catch {
      return [];
    }
  });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrLeaveRequests")) || [];
    } catch {
      return [];
    }
  });

  // Service Request State
  const [serviceRequests, setServiceRequests] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("hrServiceRequests")) || []
      );
    } catch {
      return [];
    }
  });

  // Save Employee Details
  useEffect(() => {
    localStorage.setItem("hrEmployees", JSON.stringify(employees));
  }, [employees]);

  // Save Leave Requests
  useEffect(() => {
    localStorage.setItem(
      "hrLeaveRequests",
      JSON.stringify(leaveRequests)
    );
  }, [leaveRequests]);

  // Save Service Requests
  useEffect(() => {
    localStorage.setItem(
      "hrServiceRequests",
      JSON.stringify(serviceRequests)
    );
  }, [serviceRequests]);

  return (
    <div className="portal-container">
      <Login
        employees={employees}
        setEmployees={setEmployees}
        leaveRequests={leaveRequests}
        setLeaveRequests={setLeaveRequests}
        serviceRequests={serviceRequests}
        setServiceRequests={setServiceRequests}
      />
    </div>
  );
}

export default App;