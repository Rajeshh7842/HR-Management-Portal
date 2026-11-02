import { useEffect, useRef, useState } from "react";
import "./css/hr-dashboard.css";

function generateEmployeeId(employees) {
  const highestNumber = employees.reduce((max, employee) => {
    const number = parseInt(
      (employee.employeeId || "").replace("EMP", ""),
      10
    );

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `EMP${String(highestNumber + 1).padStart(3, "0")}`;
}

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN");
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Added function to prevent selecting today or a future date as DOB
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const emptyHRProfile = {
  name: "HR Admin",
  email: "admin@company.com",
  dateOfBirth: "",
  gender: "",
  phone: "",
  address: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
};

function HRDashboard({
  employees,
  setEmployees,
  leaveRequests,
  setLeaveRequests,
  serviceRequests = [],
  setServiceRequests,
  hrProfile: initialHRProfile,
  hrUsername = "admin",
  onUpdateHRProfile,
  onChangePassword,
  onLogout,
}) {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("All");

  // Add employee fields
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [addEmployeeReturnSection, setAddEmployeeReturnSection] =
    useState("Dashboard");

  // Employee editing fields
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const [editEmployee, setEditEmployee] = useState({
    employeeName: "",
    department: "",
    email: "",
    designation: "",
    dateOfJoining: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
  });

  const [editingLeaveRequestId, setEditingLeaveRequestId] =
    useState(null);

  const [editingServiceRequestId, setEditingServiceRequestId] =
    useState(null);

  const [editServiceRequest, setEditServiceRequest] = useState({
    status: "Pending",
    hrResponse: "",
  });

  // HR profile fields
  const [hrProfile, setHrProfile] = useState({
    ...emptyHRProfile,
    ...(initialHRProfile || {}),
  });

  const [editHRProfile, setEditHRProfile] = useState({
    ...emptyHRProfile,
    ...(initialHRProfile || {}),
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const menuItems = [
    "Dashboard",
    "Add Employee",
    "View Employees",
    "Leave Requests",
    "Service Requests",
  ];

  const pendingRequests = leaveRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const pendingServiceRequests = serviceRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const filteredLeaveRequests =
    leaveStatusFilter === "All"
      ? leaveRequests
      : leaveRequests.filter(
          (request) => request.status === leaveStatusFilter
        );

  const filteredServiceRequests =
    serviceStatusFilter === "All"
      ? serviceRequests
      : serviceRequests.filter(
          (request) =>
            (request.status || "Pending") === serviceStatusFilter
        );

  useEffect(() => {
    const profile = {
      ...emptyHRProfile,
      ...(initialHRProfile || {}),
    };

    setHrProfile(profile);
    setEditHRProfile(profile);
  }, [initialHRProfile]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleSectionChange(section) {
    if (section === "Add Employee") {
      setAddEmployeeReturnSection(activeSection);
    }

    setActiveSection(section);
    setIsMenuOpen(false);
    setSuccessMessage("");
    setPasswordMessage("");
    setEditingLeaveRequestId(null);
    setEditingEmployeeId(null);
    setEditingServiceRequestId(null);

    if (section !== "Leave Requests") {
      setLeaveStatusFilter("All");
    }

    if (section !== "Service Requests") {
      setServiceStatusFilter("All");
    }
  }

  function handleDashboardCardClick(section, filter = "All") {
    setActiveSection(section);
    setIsMenuOpen(false);
    setSuccessMessage("");
    setEditingLeaveRequestId(null);
    setEditingEmployeeId(null);
    setEditingServiceRequestId(null);

    if (section === "Leave Requests") {
      setLeaveStatusFilter(filter);
    }

    if (section === "Service Requests") {
      setServiceStatusFilter(filter);
    }
  }

  function handleCloseAddEmployee() {
    setSuccessMessage("");
    setActiveSection(addEmployeeReturnSection || "Dashboard");
  }

  // Add employee
  function handleAddEmployee(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = employeeName.trim();

    if (
      !normalizedName ||
      !department.trim() ||
      !normalizedEmail ||
      !designation.trim() ||
      !dateOfJoining
    ) {
      alert("Please complete all employee details.");
      return;
    }

    if (dateOfJoining > getTodayDate()) {
      alert("Date of Joining cannot be in the future.");
      return;
    }

    const emailExists = employees.some(
      (employee) =>
        employee.email?.toLowerCase() === normalizedEmail
    );

    if (emailExists) {
      alert("An employee with this email already exists.");
      return;
    }

    const employeeId = generateEmployeeId(employees);

    const newEmployee = {
      employeeId,
      employeeName: normalizedName,
      department: department.trim(),
      email: normalizedEmail,
      designation: designation.trim(),
      dateOfJoining,

      dateOfBirth: "",
      gender: "",
      phone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactNumber: "",

      registrationStatus: "Not Registered",
      registeredAt: "",
    };

    setEmployees((previous) => [...previous, newEmployee]);

    setSuccessMessage(
      `Employee added successfully! Employee ID: ${employeeId}`
    );

    setEmployeeName("");
    setDepartment("");
    setEmail("");
    setDesignation("");
    setDateOfJoining("");
  }

  // Open employee editing form
  function handleEditEmployee(employee) {
    setEditingEmployeeId(employee.employeeId);

    setEditEmployee({
      employeeName: employee.employeeName || "",
      department: employee.department || "",
      email: employee.email || "",
      designation: employee.designation || "",
      dateOfJoining: employee.dateOfJoining || "",
      dateOfBirth: employee.dateOfBirth || "",
      gender: employee.gender || "",
      phone: employee.phone || "",
      address: employee.address || "",
      emergencyContactName: employee.emergencyContactName || "",
      emergencyContactNumber: employee.emergencyContactNumber || "",
    });

    setSuccessMessage("");
  }

  // Update employee details
  function handleUpdateEmployee(event) {
    event.preventDefault();

    const normalizedEmail = editEmployee.email.trim().toLowerCase();
    const normalizedPhone = editEmployee.phone.trim();
    const normalizedEmergencyNumber =
      editEmployee.emergencyContactNumber.trim();

    if (
      !editEmployee.employeeName.trim() ||
      !editEmployee.department.trim() ||
      !normalizedEmail ||
      !editEmployee.designation.trim() ||
      !editEmployee.dateOfJoining
    ) {
      alert("Please complete all required employment details.");
      return;
    }

    if (editEmployee.dateOfJoining > getTodayDate()) {
      alert("Date of Joining cannot be in the future.");
      return;
    }

    if (
      editEmployee.dateOfBirth &&
      editEmployee.dateOfBirth >= getTodayDate()
    ) {
      alert("Date of Birth must be before today.");
      return;
    }

    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      alert("Phone Number must contain exactly 10 digits.");
      return;
    }

    if (
      normalizedEmergencyNumber &&
      !/^\d{10}$/.test(normalizedEmergencyNumber)
    ) {
      alert("Emergency Contact Number must contain exactly 10 digits.");
      return;
    }

    const emailExists = employees.some(
      (employee) =>
        employee.employeeId !== editingEmployeeId &&
        employee.email?.toLowerCase() === normalizedEmail
    );

    if (emailExists) {
      alert("Another employee is already using this email.");
      return;
    }

    setEmployees((previous) =>
      previous.map((employee) =>
        employee.employeeId === editingEmployeeId
          ? {
              ...employee,
              employeeName: editEmployee.employeeName.trim(),
              department: editEmployee.department.trim(),
              email: normalizedEmail,
              designation: editEmployee.designation.trim(),
              dateOfJoining: editEmployee.dateOfJoining,
              dateOfBirth: editEmployee.dateOfBirth,
              gender: editEmployee.gender,
              phone: normalizedPhone,
              address: editEmployee.address.trim(),
              emergencyContactName:
                editEmployee.emergencyContactName.trim(),
              emergencyContactNumber: normalizedEmergencyNumber,
            }
          : employee
      )
    );

    setEditingEmployeeId(null);
    setSuccessMessage("Employee details updated successfully!");
  }

  function handleCancelEmployeeEdit() {
    setEditingEmployeeId(null);

    setEditEmployee({
      employeeName: "",
      department: "",
      email: "",
      designation: "",
      dateOfJoining: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
    });
  }

  function handleDeleteEmployee(employeeId, name) {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name} (${employeeId})?`
      )
    ) {
      return;
    }

    setEmployees((previous) =>
      previous.filter(
        (employee) => employee.employeeId !== employeeId
      )
    );

    if (editingEmployeeId === employeeId) {
      setEditingEmployeeId(null);
    }

    setSuccessMessage("Employee deleted successfully!");
  }

  // Leave request management
  function handleToggleLeaveEdit(requestId) {
    setEditingLeaveRequestId((previous) =>
      previous === requestId ? null : requestId
    );
  }

  function handleLeaveDecision(request, newStatus) {
    if (
      !window.confirm(
        `Are you sure you want to set ${request.employeeName}'s leave request status to ${newStatus}?`
      )
    ) {
      return;
    }

    setLeaveRequests((previous) =>
      previous.map((item) =>
        item.requestId === request.requestId
          ? {
              ...item,
              status: newStatus,
              reviewedAt: new Date().toISOString(),
            }
          : item
      )
    );

    setEditingLeaveRequestId(null);

    setSuccessMessage(
      `Leave request status updated to ${newStatus} successfully!`
    );
  }

  function handleDeleteLeaveRequest(request) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${request.employeeName}'s leave request (${request.requestId})?`
    );

    if (!confirmed) return;

    setLeaveRequests((previous) =>
      previous.filter(
        (item) => item.requestId !== request.requestId
      )
    );

    setEditingLeaveRequestId(null);
    setSuccessMessage("Leave request deleted successfully!");
  }

  // Service request management
  function handleEditServiceRequest(request) {
    setEditingServiceRequestId(request.requestId);

    setEditServiceRequest({
      status: request.status || "Pending",
      hrResponse: request.hrResponse || "",
    });

    setSuccessMessage("");
  }

  function handleCancelServiceRequestEdit() {
    setEditingServiceRequestId(null);

    setEditServiceRequest({
      status: "Pending",
      hrResponse: "",
    });
  }

  function handleUpdateServiceRequest(event) {
    event.preventDefault();

    if (!editingServiceRequestId) return;

    setServiceRequests((previous) =>
      previous.map((request) =>
        request.requestId === editingServiceRequestId
          ? {
              ...request,
              status: editServiceRequest.status,
              hrResponse: editServiceRequest.hrResponse.trim(),
              reviewedAt: new Date().toISOString(),
            }
          : request
      )
    );

    setEditingServiceRequestId(null);

    setSuccessMessage("Service request updated successfully!");
  }

  function handleDeleteServiceRequest(request) {
    const confirmed = window.confirm(
      `Are you sure you want to delete service request ${request.requestId} submitted by ${request.employeeName}?`
    );

    if (!confirmed) return;

    setServiceRequests((previous) =>
      previous.filter(
        (item) => item.requestId !== request.requestId
      )
    );

    setEditingServiceRequestId(null);

    setSuccessMessage("Service request deleted successfully!");
  }

  // Save HR personal details and profile
  function handleSaveProfile(event) {
    event.preventDefault();

    const normalizedPhone = editHRProfile.phone.trim();
    const normalizedEmergencyNumber =
      editHRProfile.emergencyContactNumber.trim();

    if (!editHRProfile.name.trim() || !editHRProfile.email.trim()) {
      alert("Please enter your name and email address.");
      return;
    }

    if (
      editHRProfile.dateOfBirth &&
      editHRProfile.dateOfBirth >= getTodayDate()
    ) {
      alert("Date of Birth must be before today.");
      return;
    }

    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      alert("Phone Number must contain exactly 10 digits.");
      return;
    }

    if (
      normalizedEmergencyNumber &&
      !/^\d{10}$/.test(normalizedEmergencyNumber)
    ) {
      alert("Emergency Contact Number must contain exactly 10 digits.");
      return;
    }

    const updatedProfile = {
      ...hrProfile,
      ...editHRProfile,
      name: editHRProfile.name.trim(),
      email: editHRProfile.email.trim().toLowerCase(),
      phone: normalizedPhone,
      address: editHRProfile.address.trim(),
      emergencyContactName:
        editHRProfile.emergencyContactName.trim(),
      emergencyContactNumber: normalizedEmergencyNumber,
    };

    setHrProfile(updatedProfile);
    setEditHRProfile(updatedProfile);

    if (onUpdateHRProfile) {
      onUpdateHRProfile(updatedProfile);
    }

    setSuccessMessage("HR personal details updated successfully!");
    setActiveSection("Personal Details");
  }

  // HR password
  function handlePasswordSubmit(event) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setPasswordError(true);
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("Passwords do not match.");
      return;
    }

    const result = onChangePassword(
      currentPassword,
      newPassword
    );

    if (!result) {
      setPasswordError(true);
      setPasswordMessage(
        "Unable to change password. Please check your current password."
      );
      return;
    }

    setPasswordError(false);
    setPasswordMessage(
      "Your HR password has been changed successfully!"
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="hr-dashboard">
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-logo">HR Portal</h2>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activeSection === item
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => handleSectionChange(item)}
            >
              {item}

              {item === "Leave Requests" && pendingRequests > 0 && (
                <span style={badgeStyle}>{pendingRequests}</span>
              )}

              {item === "Service Requests" &&
                pendingServiceRequests > 0 && (
                  <span style={badgeStyle}>
                    {pendingServiceRequests}
                  </span>
                )}
            </button>
          ))}

          <button
            className={
              activeSection === "Personal Details"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => handleSectionChange("Personal Details")}
          >
            Personal Details
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{activeSection}</h1>
            <p>Welcome to the HR Management Portal</p>
          </div>

          <div
            className="admin-profile"
            ref={menuRef}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen((previous) => !previous)
              }
              aria-expanded={isMenuOpen}
              style={profileTriggerStyle}
            >
              <span className="admin-avatar">
                {(hrProfile.name || "H").charAt(0).toUpperCase()}
              </span>

              <span>{hrProfile.name}</span>
              <span>{isMenuOpen ? "▲" : "▼"}</span>
            </button>

            {isMenuOpen && (
              <div style={dropdownStyle}>
                {[
                  ["Dashboard", "Dashboard"],
                  ["Personal Details", "Personal Details"],
                  ["Edit Profile", "Edit Profile"],
                  ["Change Password", "Change Password"],
                ].map(([label, section]) => (
                  <button
                    key={section}
                    type="button"
                    style={dropdownButtonStyle}
                    onClick={() => handleSectionChange(section)}
                  >
                    {label}
                  </button>
                ))}

                <button
                  type="button"
                  style={{
                    ...dropdownButtonStyle,
                    color: "#dc2626",
                    borderTop: "1px solid #e5e7eb",
                  }}
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {successMessage && (
          <div
            className="success-message"
            style={{ margin: "15px 25px" }}
          >
            {successMessage}
          </div>
        )}

        {/* Dashboard */}
        {activeSection === "Dashboard" && (
          <section className="dashboard-content">
            <h2>Dashboard Overview</h2>

            <p className="section-description">
              Manage employees and HR activities from one place.
              Click any card to view its details.
            </p>

            <div className="dashboard-cards">
              <div
                className="overview-card"
                style={clickableCardStyle}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleDashboardCardClick("View Employees")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDashboardCardClick("View Employees");
                  }
                }}
                title="View all employees"
              >
                <h3>Total Employees</h3>
                <p>{employees.length}</p>
              </div>

              <div
                className="overview-card"
                style={clickableCardStyle}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleDashboardCardClick("Leave Requests")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDashboardCardClick("Leave Requests");
                  }
                }}
                title="View all leave requests"
              >
                <h3>Leave Requests</h3>
                <p>{leaveRequests.length}</p>
              </div>

              <div
                className="overview-card"
                style={clickableCardStyle}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleDashboardCardClick("Leave Requests", "Pending")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDashboardCardClick("Leave Requests", "Pending");
                  }
                }}
                title="View pending leave requests"
              >
                <h3>Pending Leave Requests</h3>
                <p>{pendingRequests}</p>
              </div>

              <div
                className="overview-card"
                style={clickableCardStyle}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleDashboardCardClick("Service Requests")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDashboardCardClick("Service Requests");
                  }
                }}
                title="View all service requests"
              >
                <h3>Service Requests</h3>
                <p>{serviceRequests.length}</p>
              </div>

              <div
                className="overview-card"
                style={clickableCardStyle}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleDashboardCardClick("Service Requests", "Pending")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDashboardCardClick("Service Requests", "Pending");
                  }
                }}
                title="View pending service requests"
              >
                <h3>Pending Service Requests</h3>
                <p>{pendingServiceRequests}</p>
              </div>
            </div>
          </section>
        )}

        {/* HR Personal Details */}
        {activeSection === "Personal Details" && (
          <section className="dashboard-content">
            <h2>My Personal Details</h2>

            <p className="section-description">
              View your HR account and personal information.
            </p>

            <div className="employee-profile-card">
              <div className="employee-details">
                <div>
                  <label>Username</label>
                  <p>{hrUsername}</p>
                </div>

                <div>
                  <label>HR Name</label>
                  <p>{hrProfile.name || "-"}</p>
                </div>

                <div>
                  <label>Email Address</label>
                  <p>{hrProfile.email || "-"}</p>
                </div>

                <div>
                  <label>Date of Birth</label>
                  <p>{formatDate(hrProfile.dateOfBirth)}</p>
                </div>

                <div>
                  <label>Gender</label>
                  <p>{hrProfile.gender || "-"}</p>
                </div>

                <div>
                  <label>Phone Number</label>
                  <p>{hrProfile.phone || "-"}</p>
                </div>

                <div>
                  <label>Address</label>
                  <p>{hrProfile.address || "-"}</p>
                </div>

                <div>
                  <label>Emergency Contact Name</label>
                  <p>{hrProfile.emergencyContactName || "-"}</p>
                </div>

                <div>
                  <label>Emergency Contact Number</label>
                  <p>{hrProfile.emergencyContactNumber || "-"}</p>
                </div>

                <div>
                  <label>Role</label>
                  <p>HR Administrator</p>
                </div>

                <div>
                  <label>Access</label>
                  <p>Full HR Dashboard Access</p>
                </div>
              </div>

              <button
                style={primaryButtonStyle}
                onClick={() => {
                  setEditHRProfile({
                    ...emptyHRProfile,
                    ...hrProfile,
                  });
                  handleSectionChange("Edit Profile");
                }}
              >
                ✎ Edit Personal Details
              </button>
            </div>
          </section>
        )}

        {/* Edit HR Profile and Personal Details */}
        {activeSection === "Edit Profile" && (
          <section className="dashboard-content">
            <h2>Edit HR Personal Details</h2>

            <p className="section-description">
              Update your account and personal information. Personal
              details are optional and can be updated whenever needed.
            </p>

            <form
              className="employee-form"
              onSubmit={handleSaveProfile}
            >
              <h3 style={formSectionHeadingStyle}>
                HR Account Details
              </h3>

              <div className="form-group">
                <label>Username</label>
                <input value={hrUsername} readOnly />
              </div>

              <div className="form-group">
                <label>HR Name</label>
                <input
                  value={editHRProfile.name}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editHRProfile.email}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <h3 style={formSectionHeadingStyle}>
                Personal Details
              </h3>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  max={getYesterdayDate()}
                  value={editHRProfile.dateOfBirth}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      dateOfBirth: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  value={editHRProfile.gender}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      gender: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editHRProfile.phone}
                  maxLength={10}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={editHRProfile.address}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      address: e.target.value,
                    }))
                  }
                  rows="3"
                  placeholder="Enter your address"
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  value={editHRProfile.emergencyContactName}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      emergencyContactName: e.target.value,
                    }))
                  }
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Number</label>
                <input
                  type="tel"
                  value={editHRProfile.emergencyContactNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setEditHRProfile((previous) => ({
                      ...previous,
                      emergencyContactNumber: e.target.value.replace(
                        /\D/g,
                        ""
                      ),
                    }))
                  }
                  placeholder="Enter 10-digit emergency number"
                />
              </div>

              <div className="employee-form-buttons">
                <button
                  className="add-employee-button"
                  type="submit"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  className="close-employee-button"
                  onClick={() =>
                    handleSectionChange("Personal Details")
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Change Password */}
        {activeSection === "Change Password" && (
          <section className="dashboard-content">
            <h2>Change HR Password</h2>

            <p className="section-description">
              Enter your current password and choose a new password.
            </p>

            <form
              className="employee-form"
              onSubmit={handlePasswordSubmit}
            >
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  minLength={8}
                  required
                />
              </div>

              {passwordMessage && (
                <p
                  style={{
                    color: passwordError ? "#dc2626" : "#15803d",
                  }}
                >
                  {passwordMessage}
                </p>
              )}

              <button
                className="add-employee-button"
                type="submit"
              >
                Update Password
              </button>
            </form>
          </section>
        )}

        {/* Add Employee */}
        {activeSection === "Add Employee" && (
          <section className="dashboard-content">
            <div style={addEmployeeHeaderStyle}>
              <div>
                <h2>Add New Employee</h2>

                <p className="section-description">
                  Create a new employee profile. The employee can create
                  their own login username and password through signup.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAddEmployee}
                style={closeAddEmployeeButtonStyle}
                title="Close Add Employee"
                aria-label="Close Add Employee"
              >
                ×
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleAddEmployee}
            >
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  value={generateEmployeeId(employees)}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Employee Name</label>
                <input
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter department"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter employee email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Enter employee designation"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Joining</label>
                <input
                  type="date"
                  value={dateOfJoining}
                  max={getTodayDate()}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  required
                />
              </div>

              <div className="employee-form-buttons">
                <button
                  type="submit"
                  className="add-employee-button"
                >
                  Add Employee
                </button>

                <button
                  type="button"
                  className="close-employee-button"
                  onClick={handleCloseAddEmployee}
                >
                  Close
                </button>
              </div>
            </form>
          </section>
        )}

        {/* View Employees */}
        {activeSection === "View Employees" && (
          <section className="dashboard-content">
            <h2>All Employees</h2>

            <p className="section-description">
              View, edit and manage employment and personal information.
            </p>

            {employees.length === 0 ? (
              <div className="module-placeholder">
                No employees have been added yet.
              </div>
            ) : (
              <>
                {editingEmployeeId && (
                  <div style={editEmployeeCardStyle}>
                    <h3>Edit Employee Details</h3>

                    <p className="section-description">
                      HR can correct the employee's employment and
                      personal information here.
                    </p>

                    <form
                      className="employee-form"
                      onSubmit={handleUpdateEmployee}
                    >
                      <h3 style={formSectionHeadingStyle}>
                        Official Employment Details
                      </h3>

                      <div className="form-group">
                        <label>Employee ID</label>
                        <input value={editingEmployeeId} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Employee Name</label>
                        <input
                          value={editEmployee.employeeName}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              employeeName: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Department</label>
                        <input
                          value={editEmployee.department}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              department: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Company Email</label>
                        <input
                          type="email"
                          value={editEmployee.email}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Designation</label>
                        <input
                          value={editEmployee.designation}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              designation: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Date of Joining</label>
                        <input
                          type="date"
                          value={editEmployee.dateOfJoining}
                          max={getTodayDate()}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              dateOfJoining: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <h3 style={formSectionHeadingStyle}>
                        Employee Personal Details
                      </h3>

                      <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          max={getYesterdayDate()}
                          value={editEmployee.dateOfBirth}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              dateOfBirth: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          value={editEmployee.gender}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              gender: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={editEmployee.phone}
                          maxLength={10}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              phone: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="Enter 10-digit phone number"
                        />
                      </div>

                      <div className="form-group">
                        <label>Address</label>
                        <textarea
                          value={editEmployee.address}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              address: e.target.value,
                            }))
                          }
                          rows="3"
                          placeholder="Enter employee address"
                        />
                      </div>

                      <div className="form-group">
                        <label>Emergency Contact Name</label>
                        <input
                          value={editEmployee.emergencyContactName}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              emergencyContactName: e.target.value,
                            }))
                          }
                          placeholder="Enter emergency contact name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Emergency Contact Number</label>
                        <input
                          type="tel"
                          value={editEmployee.emergencyContactNumber}
                          maxLength={10}
                          onChange={(e) =>
                            setEditEmployee((previous) => ({
                              ...previous,
                              emergencyContactNumber: e.target.value.replace(
                                /\D/g,
                                ""
                              ),
                            }))
                          }
                          placeholder="Enter 10-digit emergency number"
                        />
                      </div>

                      <div className="employee-form-buttons">
                        <button
                          type="submit"
                          className="add-employee-button"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          className="close-employee-button"
                          onClick={handleCancelEmployeeEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={employeeTableWrapperStyle}>
                  <table style={employeeTableStyle}>
                    <thead>
                      <tr>
                        {[
                          "Employee ID",
                          "Employee Name",
                          "Username",
                          "Department",
                          "Designation",
                          "Email",
                          "Date of Joining",
                          "Date of Birth",
                          "Gender",
                          "Phone",
                          "Address",
                          "Emergency Contact",
                          "Emergency Number",
                          "Registration Status",
                          "Registration Date",
                          "Action",
                        ].map((heading) => (
                          <th key={heading} style={tableHeaderStyle}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.employeeId}>
                          <td style={tableCellStyle}>
                            {employee.employeeId}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.employeeName}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.username || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.department}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.designation || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.email}
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(employee.dateOfJoining)}
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(employee.dateOfBirth)}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.gender || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.phone || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.address || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.emergencyContactName || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {employee.emergencyContactNumber || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={registrationStatusStyle(
                                employee.registrationStatus
                              )}
                            >
                              {employee.registrationStatus ||
                                (employee.username
                                  ? "Registered"
                                  : "Not Registered")}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(employee.registeredAt)}
                          </td>
                          <td style={tableCellStyle}>
                            <div style={employeeActionStyle}>
                              <button
                                type="button"
                                style={editEmployeeButtonStyle}
                                onClick={() =>
                                  handleEditEmployee(employee)
                                }
                                title="Edit employee"
                              >
                                ✎ Edit
                              </button>

                              <button
                                type="button"
                                style={deleteButtonStyle}
                                onClick={() =>
                                  handleDeleteEmployee(
                                    employee.employeeId,
                                    employee.employeeName
                                  )
                                }
                                title="Delete employee"
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        {/* Leave Requests */}
        {activeSection === "Leave Requests" && (
          <section className="dashboard-content">
            <h2>Employee Leave Requests</h2>

            <p className="section-description">
              Review employee leave applications, change decisions,
              or delete requests.
            </p>

            <div style={filterContainerStyle}>
              <label htmlFor="leaveStatusFilter">
                Filter by Status:
              </label>

              <select
                id="leaveStatusFilter"
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {filteredLeaveRequests.length === 0 ? (
              <div className="module-placeholder">
                {leaveStatusFilter === "All"
                  ? "No leave requests have been submitted yet."
                  : `No ${leaveStatusFilter.toLowerCase()} leave requests found.`}
              </div>
            ) : (
              <div style={tableWrapperStyle}>
                <table style={leaveTableStyle}>
                  <thead>
                    <tr>
                      {[
                        "Request ID",
                        "Employee",
                        "Department",
                        "Leave Type",
                        "From",
                        "To",
                        "Days",
                        "Reason",
                        "Applied On",
                        "Status",
                        "Action",
                      ].map((heading) => (
                        <th key={heading} style={tableHeaderStyle}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeaveRequests.map((request) => (
                      <tr key={request.requestId}>
                        <td style={tableCellStyle}>
                          {request.requestId}
                        </td>
                        <td style={tableCellStyle}>
                          <strong>{request.employeeName}</strong>
                          <br />
                          <small>{request.employeeId}</small>
                        </td>
                        <td style={tableCellStyle}>
                          {request.department}
                        </td>
                        <td style={tableCellStyle}>
                          {request.leaveType}
                        </td>
                        <td style={tableCellStyle}>
                          {formatDate(request.startDate)}
                        </td>
                        <td style={tableCellStyle}>
                          {formatDate(request.endDate)}
                        </td>
                        <td style={tableCellStyle}>
                          {request.totalDays}
                        </td>
                        <td style={tableCellStyle}>
                          {request.reason}
                        </td>
                        <td style={tableCellStyle}>
                          {request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td style={tableCellStyle}>
                          <span style={statusStyle(request.status)}>
                            {request.status}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={actionContainerStyle}>
                            <div style={iconActionsStyle}>
                              <button
                                type="button"
                                style={editIconButtonStyle}
                                onClick={() =>
                                  handleToggleLeaveEdit(request.requestId)
                                }
                                title="Edit leave decision"
                                aria-label="Edit leave decision"
                                aria-expanded={
                                  editingLeaveRequestId === request.requestId
                                }
                              >
                                ✎
                              </button>

                              <button
                                type="button"
                                style={deleteIconButtonStyle}
                                onClick={() =>
                                  handleDeleteLeaveRequest(request)
                                }
                                title="Delete leave request"
                                aria-label="Delete leave request"
                              >
                                🗑
                              </button>
                            </div>

                            {editingLeaveRequestId === request.requestId && (
                              <div style={decisionOptionsStyle}>
                                <button
                                  type="button"
                                  style={approveButtonStyle}
                                  onClick={() =>
                                    handleLeaveDecision(request, "Approved")
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  style={rejectButtonStyle}
                                  onClick={() =>
                                    handleLeaveDecision(request, "Rejected")
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Service Requests */}
        {activeSection === "Service Requests" && (
          <section className="dashboard-content">
            <h2>Employee Service Requests</h2>

            <p className="section-description">
              View employee requests, update their status and provide
              responses.
            </p>

            <div style={filterContainerStyle}>
              <label htmlFor="serviceStatusFilter">
                Filter by Status:
              </label>

              <select
                id="serviceStatusFilter"
                value={serviceStatusFilter}
                onChange={(e) =>
                  setServiceStatusFilter(e.target.value)
                }
                style={filterSelectStyle}
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {filteredServiceRequests.length === 0 ? (
              <div className="module-placeholder">
                {serviceStatusFilter === "All"
                  ? "No service requests have been submitted yet."
                  : `No ${serviceStatusFilter.toLowerCase()} service requests found.`}
              </div>
            ) : (
              <>
                {editingServiceRequestId && (
                  <div style={editEmployeeCardStyle}>
                    <h3>Update Service Request</h3>

                    <form
                      className="employee-form"
                      onSubmit={handleUpdateServiceRequest}
                    >
                      <div className="form-group">
                        <label>Request ID</label>
                        <input
                          value={editingServiceRequestId}
                          readOnly
                        />
                      </div>

                      <div className="form-group">
                        <label>Request Status</label>
                        <select
                          value={editServiceRequest.status}
                          onChange={(e) =>
                            setEditServiceRequest((previous) => ({
                              ...previous,
                              status: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>HR Response</label>
                        <textarea
                          value={editServiceRequest.hrResponse}
                          onChange={(e) =>
                            setEditServiceRequest((previous) => ({
                              ...previous,
                              hrResponse: e.target.value,
                            }))
                          }
                          rows="4"
                          placeholder="Enter your response to the employee"
                        />
                      </div>

                      <div className="employee-form-buttons">
                        <button
                          type="submit"
                          className="add-employee-button"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          className="close-employee-button"
                          onClick={handleCancelServiceRequestEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={serviceTableWrapperStyle}>
                  <table style={serviceTableStyle}>
                    <thead>
                      <tr>
                        {[
                          "Request ID",
                          "Employee",
                          "Department",
                          "Category",
                          "Subject",
                          "Description",
                          "Applied On",
                          "Status",
                          "HR Response",
                          "Action",
                        ].map((heading) => (
                          <th key={heading} style={tableHeaderStyle}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredServiceRequests.map((request) => (
                        <tr key={request.requestId}>
                          <td style={tableCellStyle}>
                            {request.requestId}
                          </td>
                          <td style={tableCellStyle}>
                            <strong>{request.employeeName}</strong>
                            <br />
                            <small>{request.employeeId}</small>
                          </td>
                          <td style={tableCellStyle}>
                            {request.department || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {request.category || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {request.subject || "-"}
                          </td>
                          <td style={serviceDescriptionCellStyle}>
                            {request.description || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            {request.createdAt
                              ? new Date(
                                  request.createdAt
                                ).toLocaleDateString("en-IN")
                              : "-"}
                          </td>
                          <td style={tableCellStyle}>
                            <span style={serviceStatusStyle(request.status)}>
                              {request.status || "Pending"}
                            </span>
                          </td>
                          <td style={serviceDescriptionCellStyle}>
                            {request.hrResponse || "No response yet"}
                          </td>
                          <td style={tableCellStyle}>
                            <div style={employeeActionStyle}>
                              <button
                                type="button"
                                style={editEmployeeButtonStyle}
                                onClick={() =>
                                  handleEditServiceRequest(request)
                                }
                              >
                                ✎ Update
                              </button>

                              <button
                                type="button"
                                style={deleteButtonStyle}
                                onClick={() =>
                                  handleDeleteServiceRequest(request)
                                }
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// Common styles
const badgeStyle = {
  marginLeft: "auto",
  background: "#dc2626",
  color: "white",
  borderRadius: "20px",
  padding: "2px 8px",
  fontSize: "12px",
};

const clickableCardStyle = {
  cursor: "pointer",
};

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "18px",
  flexWrap: "wrap",
};

const filterSelectStyle = {
  padding: "9px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  background: "white",
  color: "#334155",
  cursor: "pointer",
};

const profileTriggerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontWeight: "600",
};

const dropdownStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  width: "210px",
  maxWidth: "calc(100vw - 40px)",
  boxSizing: "border-box",
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  boxShadow: "0 5px 18px rgba(0,0,0,0.12)",
  padding: "8px",
  zIndex: 1000,
};

const dropdownButtonStyle = {
  display: "block",
  width: "100%",
  padding: "11px 12px",
  textAlign: "left",
  border: "none",
  background: "white",
  cursor: "pointer",
  borderRadius: "5px",
  fontSize: "14px",
};

const primaryButtonStyle = {
  marginTop: "20px",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const deleteButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "5px",
  cursor: "pointer",
};

const editEmployeeButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "5px",
  cursor: "pointer",
};

const employeeActionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
  minWidth: "95px",
};

const editEmployeeCardStyle = {
  background: "white",
  padding: "22px",
  marginBottom: "22px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const formSectionHeadingStyle = {
  gridColumn: "1 / -1",
  marginTop: "10px",
  paddingBottom: "10px",
  borderBottom: "1px solid #e5e7eb",
  color: "#334155",
};

const addEmployeeHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "15px",
};

const closeAddEmployeeButtonStyle = {
  width: "36px",
  height: "36px",
  flexShrink: 0,
  border: "1px solid #cbd5e1",
  borderRadius: "50%",
  background: "white",
  color: "#475569",
  fontSize: "25px",
  lineHeight: "1",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const employeeTableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  background: "white",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const employeeTableStyle = {
  width: "100%",
  minWidth: "2100px",
  borderCollapse: "collapse",
  fontSize: "13px",
  textAlign: "left",
};

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  background: "white",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const leaveTableStyle = {
  width: "100%",
  minWidth: "1200px",
  borderCollapse: "collapse",
  fontSize: "13px",
  textAlign: "left",
};

const serviceTableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  background: "white",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const serviceTableStyle = {
  width: "100%",
  minWidth: "1500px",
  borderCollapse: "collapse",
  fontSize: "13px",
  textAlign: "left",
};

const tableHeaderStyle = {
  padding: "13px 12px",
  background: "#f1f5f9",
  color: "#334155",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "13px 12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#334155",
  verticalAlign: "top",
};

const serviceDescriptionCellStyle = {
  ...tableCellStyle,
  minWidth: "180px",
  maxWidth: "260px",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

function registrationStatusStyle(status) {
  const isRegistered = status === "Registered";

  return {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    background: isRegistered ? "#dcfce7" : "#fef3c7",
    color: isRegistered ? "#166534" : "#92400e",
    whiteSpace: "nowrap",
  };
}

function statusStyle(status) {
  const colors = {
    Approved: ["#dcfce7", "#166534"],
    Rejected: ["#fee2e2", "#991b1b"],
    Pending: ["#fef3c7", "#92400e"],
  };

  const [background, color] = colors[status] || colors.Pending;

  return {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    background,
    color,
  };
}

function serviceStatusStyle(status) {
  const colors = {
    Pending: ["#fef3c7", "#92400e"],
    "In Progress": ["#dbeafe", "#1d4ed8"],
    Resolved: ["#dcfce7", "#166534"],
    Rejected: ["#fee2e2", "#991b1b"],
  };

  const [background, color] =
    colors[status] || colors.Pending;

  return {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    background,
    color,
    whiteSpace: "nowrap",
  };
}

const actionContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: "90px",
};

const iconActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const editIconButtonStyle = {
  width: "32px",
  height: "32px",
  border: "none",
  borderRadius: "5px",
  background: "#2563eb",
  color: "white",
  fontSize: "19px",
  cursor: "pointer",
};

const deleteIconButtonStyle = {
  width: "32px",
  height: "32px",
  border: "none",
  borderRadius: "5px",
  background: "#dc2626",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
};

const decisionOptionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "7px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
};

const approveButtonStyle = {
  padding: "7px 10px",
  border: "none",
  borderRadius: "5px",
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
};

const rejectButtonStyle = {
  padding: "7px 10px",
  border: "none",
  borderRadius: "5px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
};

export default HRDashboard;