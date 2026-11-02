
import { useEffect, useRef, useState } from "react";
import "./css/employee-dashboard.css";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateLeaveDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.floor((end - start) / 86400000) + 1;
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN");
}

function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN");
}

function EmployeeDashboard({
  employee,
  employees,
  onUpdateEmployee,
  onChangePassword,
  leaveRequests,
  setLeaveRequests,
  serviceRequests = [],
  setServiceRequests,
  onLogout,
}) {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Employee personal details
  const [dateOfBirth, setDateOfBirth] = useState(
    employee.dateOfBirth || ""
  );
  const [gender, setGender] = useState(employee.gender || "");
  const [phone, setPhone] = useState(employee.phone || "");
  const [address, setAddress] = useState(employee.address || "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    employee.emergencyContactName || ""
  );
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(
    employee.emergencyContactNumber || ""
  );

  // Leave request states
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveSuccessMessage, setLeaveSuccessMessage] = useState("");
  const [editingLeaveRequestId, setEditingLeaveRequestId] = useState(null);

  // Service request states
  const [serviceCategory, setServiceCategory] = useState("IT Support");
  const [serviceSubject, setServiceSubject] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceSuccessMessage, setServiceSuccessMessage] = useState("");
  const [editingServiceRequestId, setEditingServiceRequestId] =
    useState(null);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const menuRef = useRef(null);

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Personal Details", icon: "♙" },
    { name: "Apply for Leave", icon: "▣" },
    { name: "My Leave Requests", icon: "◷" },
    { name: "Service Requests", icon: "⚙" },
  ];

  // Employee's own leave requests
  const myLeaveRequests = (leaveRequests || []).filter(
    (request) => request.employeeId === employee.employeeId
  );

  const pendingCount = myLeaveRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  // Employee's own service requests
  const myServiceRequests = (serviceRequests || []).filter(
    (request) => request.employeeId === employee.employeeId
  );

  const pendingServiceCount = myServiceRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  // Keep the form synchronized with the latest employee profile.
  useEffect(() => {
    setDateOfBirth(employee.dateOfBirth || "");
    setGender(employee.gender || "");
    setPhone(employee.phone || "");
    setAddress(employee.address || "");
    setEmergencyContactName(employee.emergencyContactName || "");
    setEmergencyContactNumber(employee.emergencyContactNumber || "");
  }, [employee]);

  // Close profile dropdown when clicking outside.
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

  function navigateTo(section) {
    setActiveSection(section);
    setIsMenuOpen(false);
    setIsEditing(false);
    setLeaveSuccessMessage("");
    setServiceSuccessMessage("");
    setPasswordMessage("");

    if (section !== "Apply for Leave") {
      setEditingLeaveRequestId(null);
    }

    if (section !== "Service Requests") {
      setEditingServiceRequestId(null);
    }
  }

  // PERSONAL DETAILS

  function startEditing() {
    setDateOfBirth(employee.dateOfBirth || "");
    setGender(employee.gender || "");
    setPhone(employee.phone || "");
    setAddress(employee.address || "");
    setEmergencyContactName(employee.emergencyContactName || "");
    setEmergencyContactNumber(employee.emergencyContactNumber || "");

    setIsEditing(true);
    setActiveSection("Personal Details");
    setIsMenuOpen(false);
  }

  function cancelEditing() {
    setDateOfBirth(employee.dateOfBirth || "");
    setGender(employee.gender || "");
    setPhone(employee.phone || "");
    setAddress(employee.address || "");
    setEmergencyContactName(employee.emergencyContactName || "");
    setEmergencyContactNumber(employee.emergencyContactNumber || "");

    setIsEditing(false);
  }

  function handleSaveProfile(event) {
    event.preventDefault();

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (
      emergencyContactNumber.trim() &&
      !/^[0-9]{10}$/.test(emergencyContactNumber.trim())
    ) {
      alert("Please enter a valid 10-digit emergency contact number.");
      return;
    }

    if (dateOfBirth && dateOfBirth >= getTodayDate()) {
      alert("Date of Birth must be earlier than today.");
      return;
    }

    onUpdateEmployee({
      ...employee,
      dateOfBirth,
      gender,
      phone: phone.trim(),
      address: address.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactNumber: emergencyContactNumber.trim(),
    });

    setIsEditing(false);
    alert("Personal details updated successfully!");
  }

  // CHANGE PASSWORD

  function handlePasswordSubmit(event) {
    event.preventDefault();

    const result = onChangePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (result) {
      setPasswordError(true);
      setPasswordMessage(result);
      return;
    }

    setPasswordError(false);
    setPasswordMessage("Your password has been changed successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  // LEAVE REQUESTS

  function handleEditLeave(request) {
    if (request.status !== "Pending") {
      alert("Only pending leave requests can be edited.");
      return;
    }

    setEditingLeaveRequestId(request.requestId);
    setLeaveType(request.leaveType);
    setStartDate(request.startDate);
    setEndDate(request.endDate);
    setReason(request.reason);

    setLeaveSuccessMessage("");
    setActiveSection("Apply for Leave");
  }

  function handleCancelLeaveEdit() {
    setEditingLeaveRequestId(null);
    setLeaveType("Casual Leave");
    setStartDate("");
    setEndDate("");
    setReason("");
    setLeaveSuccessMessage("");
  }

  function handleDeleteLeave(request) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete leave request ${request.requestId}?`
    );

    if (!confirmDelete) return;

    setLeaveRequests((previous) =>
      previous.filter((item) => item.requestId !== request.requestId)
    );

    if (editingLeaveRequestId === request.requestId) {
      setEditingLeaveRequestId(null);
    }

    alert("Leave request deleted successfully.");
  }

  function handleApplyLeave(event) {
    event.preventDefault();

    if (!startDate || !endDate || !reason.trim()) {
      alert("Please complete all leave application fields.");
      return;
    }

    if (startDate < getTodayDate()) {
      alert("You cannot apply for leave for a past date.");
      return;
    }

    if (endDate < startDate) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    const totalDays = calculateLeaveDays(startDate, endDate);

    if (editingLeaveRequestId) {
      setLeaveRequests((previous) =>
        previous.map((request) =>
          request.requestId === editingLeaveRequestId
            ? {
                ...request,
                employeeName: employee.employeeName,
                department: employee.department,
                leaveType,
                startDate,
                endDate,
                totalDays,
                reason: reason.trim(),
              }
            : request
        )
      );

      setLeaveSuccessMessage(
        `Leave request ${editingLeaveRequestId} updated successfully!`
      );

      setEditingLeaveRequestId(null);
    } else {
      const newRequest = {
        requestId: `LR-${Date.now()}`,
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        department: employee.department,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason: reason.trim(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      setLeaveRequests((previous) => [...previous, newRequest]);

      setLeaveSuccessMessage(
        `Leave application submitted successfully! Request ID: ${newRequest.requestId}`
      );
    }

    setStartDate("");
    setEndDate("");
    setReason("");
    setLeaveType("Casual Leave");
  }

  // SERVICE REQUESTS

  function resetServiceForm() {
    setServiceCategory("IT Support");
    setServiceSubject("");
    setServiceDescription("");
    setEditingServiceRequestId(null);
  }

  function handleEditServiceRequest(request) {
    if (request.status !== "Pending") {
      alert("Only pending service requests can be edited.");
      return;
    }

    setEditingServiceRequestId(request.requestId);
    setServiceCategory(request.category);
    setServiceSubject(request.subject);
    setServiceDescription(request.description);

    setServiceSuccessMessage("");
    setActiveSection("Service Requests");
  }

  function handleCancelServiceEdit() {
    resetServiceForm();
    setServiceSuccessMessage("");
  }

  function handleSubmitServiceRequest(event) {
    event.preventDefault();

    if (!serviceCategory || !serviceSubject.trim() || !serviceDescription.trim()) {
      alert("Please complete all service request fields.");
      return;
    }

    if (serviceSubject.trim().length < 3) {
      alert("Subject must contain at least 3 characters.");
      return;
    }

    if (serviceDescription.trim().length < 10) {
      alert("Description must contain at least 10 characters.");
      return;
    }

    if (typeof setServiceRequests !== "function") {
      alert(
        "Service Requests are not connected. Please check App.jsx and Login.jsx."
      );
      return;
    }

    if (editingServiceRequestId) {
      setServiceRequests((previous) =>
        previous.map((request) =>
          request.requestId === editingServiceRequestId
            ? {
                ...request,
                category: serviceCategory,
                subject: serviceSubject.trim(),
                description: serviceDescription.trim(),
                updatedAt: new Date().toISOString(),
              }
            : request
        )
      );

      setServiceSuccessMessage(
        `Service request ${editingServiceRequestId} updated successfully!`
      );
    } else {
      const newRequest = {
        requestId: `SR-${Date.now()}`,
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        department: employee.department,
        email: employee.email,
        category: serviceCategory,
        subject: serviceSubject.trim(),
        description: serviceDescription.trim(),
        createdAt: new Date().toISOString(),
        status: "Pending",
        hrResponse: "",
      };

      setServiceRequests((previous) => [...previous, newRequest]);

      setServiceSuccessMessage(
        `Service request submitted successfully! Request ID: ${newRequest.requestId}`
      );
    }

    resetServiceForm();
  }

  // DELETE SERVICE REQUEST
  // Employees can delete requests regardless of their status.

  function handleDeleteServiceRequest(request) {
    if (typeof setServiceRequests !== "function") {
      alert("Service Requests are not connected. Please check App.jsx and Login.jsx.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete service request ${request.requestId}?`
    );

    if (!confirmDelete) return;

    setServiceRequests((previous) =>
      previous.filter((item) => item.requestId !== request.requestId)
    );

    if (editingServiceRequestId === request.requestId) {
      resetServiceForm();
    }

    setServiceSuccessMessage("Service request deleted successfully!");
  }

  return (
    <div className="employee-dashboard">
      <aside className="employee-sidebar">
        <div className="employee-sidebar-logo">
          HR <span>Portal</span>
        </div>

        <p className="employee-sidebar-heading">EMPLOYEE MENU</p>

        <nav className="employee-sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={
                activeSection === item.name
                  ? "employee-sidebar-link active"
                  : "employee-sidebar-link"
              }
              onClick={() => navigateTo(item.name)}
            >
              <span className="employee-menu-icon">{item.icon}</span>
              {item.name}

              {item.name === "My Leave Requests" && pendingCount > 0 && (
                <span style={notificationBadgeStyle}>{pendingCount}</span>
              )}

              {item.name === "Service Requests" &&
                pendingServiceCount > 0 && (
                  <span style={notificationBadgeStyle}>
                    {pendingServiceCount}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <button
          className="employee-sidebar-logout"
          type="button"
          onClick={onLogout}
        >
          <span>↪</span> Logout
        </button>
      </aside>

      <div className="employee-content-area">
        <header className="employee-topbar">
          <div>
            <h2>{activeSection}</h2>
            <p>HR Management Portal / {activeSection}</p>
          </div>

          <div className="employee-profile-menu" ref={menuRef}>
            <button
              type="button"
              className="employee-profile-trigger"
              onClick={() => setIsMenuOpen((previous) => !previous)}
              aria-expanded={isMenuOpen}
            >
              <span className="employee-avatar">
                {employee.employeeName.charAt(0).toUpperCase()}
              </span>

              <span className="employee-profile-name">
                <strong>{employee.employeeName}</strong>
                <small>Employee</small>
              </span>

              <span className="employee-dropdown-arrow">
                {isMenuOpen ? "▲" : "▼"}
              </span>
            </button>

            {isMenuOpen && (
              <div className="employee-dropdown">
                <button onClick={() => navigateTo("Dashboard")}>
                  Dashboard
                </button>

                <button onClick={() => navigateTo("Personal Details")}>
                  Personal Details
                </button>

                <button onClick={startEditing}>
                  Edit Profile
                </button>

                <button onClick={() => navigateTo("Change Password")}>
                  Change Password
                </button>

                <button
                  className="employee-dropdown-logout"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="employee-page-content">
          {/* DASHBOARD */}

          {activeSection === "Dashboard" && (
            <>
              <div className="employee-welcome-card">
                <div>
                  <h1>Welcome, {employee.employeeName}!</h1>
                  <p>
                    Welcome to your employee dashboard. Manage your
                    personal information and employee activities here.
                  </p>
                </div>
                <div className="employee-welcome-icon">♙</div>
              </div>

              <div className="employee-overview-cards">
                <div className="employee-overview-card">
                  <span>Personal Details</span>
                  <h3>My Profile</h3>
                  <button onClick={() => navigateTo("Personal Details")}>
                    View Details →
                  </button>
                </div>

                <div className="employee-overview-card">
                  <span>Leave Management</span>
                  <h3>Apply for Leave</h3>
                  <button onClick={() => navigateTo("Apply for Leave")}>
                    Apply Now →
                  </button>
                </div>

                <div className="employee-overview-card">
                  <span>Leave Tracking</span>
                  <h3>{myLeaveRequests.length} Requests</h3>
                  <button onClick={() => navigateTo("My Leave Requests")}>
                    View Requests →
                  </button>
                </div>

                <div className="employee-overview-card">
                  <span>Pending Applications</span>
                  <h3>{pendingCount} Pending</h3>
                  <button onClick={() => navigateTo("My Leave Requests")}>
                    Check Status →
                  </button>
                </div>

                <div className="employee-overview-card">
                  <span>Service Requests</span>
                  <h3>{myServiceRequests.length} Requests</h3>
                  <button onClick={() => navigateTo("Service Requests")}>
                    View Requests →
                  </button>
                </div>

                <div className="employee-overview-card">
                  <span>Pending Service Requests</span>
                  <h3>{pendingServiceCount} Pending</h3>
                  <button onClick={() => navigateTo("Service Requests")}>
                    Check Status →
                  </button>
                </div>
              </div>

              <section className="employee-section-card">
                <div className="employee-section-heading">
                  <h2>My Profile</h2>
                  <button onClick={startEditing}>✎ Edit Profile</button>
                </div>

                <div className="employee-details">
                  <div>
                    <label>Employee ID</label>
                    <p>{employee.employeeId}</p>
                  </div>
                  <div>
                    <label>Employee Name</label>
                    <p>{employee.employeeName}</p>
                  </div>
                  <div>
                    <label>Department</label>
                    <p>{employee.department}</p>
                  </div>
                  <div>
                    <label>Email Address</label>
                    <p>{employee.email}</p>
                  </div>
                  <div>
                    <label>Designation</label>
                    <p>{employee.designation || "-"}</p>
                  </div>
                  <div>
                    <label>Date of Joining</label>
                    <p>{formatDate(employee.dateOfJoining)}</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* PERSONAL DETAILS */}

          {activeSection === "Personal Details" && (
            <section className="employee-section-card">
              <div className="employee-section-heading">
                <h2>Personal Details</h2>

                {!isEditing && (
                  <button onClick={startEditing}>✎ Edit Profile</button>
                )}
              </div>

              {isEditing ? (
                <form
                  className="employee-edit-form"
                  onSubmit={handleSaveProfile}
                >
                  <h3 style={subHeadingStyle}>Employment Information</h3>

                  <div className="employee-form-group">
                    <label>Employee ID</label>
                    <input value={employee.employeeId} readOnly />
                  </div>

                  <div className="employee-form-group">
                    <label>Employee Name</label>
                    <input value={employee.employeeName} readOnly />
                  </div>

                  <div className="employee-form-group">
                    <label>Department</label>
                    <input value={employee.department} readOnly />
                  </div>

                  <div className="employee-form-group">
                    <label>Email Address</label>
                    <input value={employee.email} readOnly />
                  </div>

                  <div className="employee-form-group">
                    <label>Designation</label>
                    <input value={employee.designation || "-"} readOnly />
                  </div>

                  <div className="employee-form-group">
                    <label>Date of Joining</label>
                    <input value={employee.dateOfJoining || "-"} readOnly />
                  </div>

                  <h3 style={subHeadingStyle}>Personal Information</h3>

                  <div className="employee-form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      max={getTodayDate()}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="employee-form-group">
                    <label>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
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

                  <div className="employee-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      required
                    />
                  </div>

                  <div
                    className="employee-form-group"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label>Current Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your current residential address"
                      rows="3"
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  <h3 style={subHeadingStyle}>
                    Emergency Contact Information
                  </h3>

                  <div className="employee-form-group">
                    <label>Emergency Contact Name</label>
                    <input
                      value={emergencyContactName}
                      onChange={(e) =>
                        setEmergencyContactName(e.target.value)
                      }
                      placeholder="Enter contact person's name"
                    />
                  </div>

                  <div className="employee-form-group">
                    <label>Emergency Contact Number</label>
                    <input
                      type="tel"
                      value={emergencyContactNumber}
                      onChange={(e) =>
                        setEmergencyContactNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="Enter 10-digit contact number"
                      maxLength="10"
                    />
                  </div>

                  <div className="employee-form-actions">
                    <button type="submit">Save Changes</button>
                    <button
                      type="button"
                      className="employee-cancel-button"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 style={subHeadingStyle}>Employment Information</h3>

                  <div className="employee-details">
                    <div>
                      <label>Employee ID</label>
                      <p>{employee.employeeId}</p>
                    </div>
                    <div>
                      <label>Employee Name</label>
                      <p>{employee.employeeName}</p>
                    </div>
                    <div>
                      <label>Department</label>
                      <p>{employee.department}</p>
                    </div>
                    <div>
                      <label>Email Address</label>
                      <p>{employee.email}</p>
                    </div>
                    <div>
                      <label>Designation</label>
                      <p>{employee.designation || "-"}</p>
                    </div>
                    <div>
                      <label>Date of Joining</label>
                      <p>{formatDate(employee.dateOfJoining)}</p>
                    </div>
                  </div>

                  <h3 style={subHeadingStyle}>Personal Information</h3>

                  <div className="employee-details">
                    <div>
                      <label>Date of Birth</label>
                      <p>{formatDate(employee.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label>Gender</label>
                      <p>{employee.gender || "-"}</p>
                    </div>
                    <div>
                      <label>Phone Number</label>
                      <p>{employee.phone || "-"}</p>
                    </div>
                    <div>
                      <label>Current Address</label>
                      <p>{employee.address || "-"}</p>
                    </div>
                  </div>

                  <h3 style={subHeadingStyle}>
                    Emergency Contact Information
                  </h3>

                  <div className="employee-details">
                    <div>
                      <label>Emergency Contact Name</label>
                      <p>{employee.emergencyContactName || "-"}</p>
                    </div>
                    <div>
                      <label>Emergency Contact Number</label>
                      <p>{employee.emergencyContactNumber || "-"}</p>
                    </div>
                  </div>

                  <button
                    className="employee-back-button"
                    onClick={() => navigateTo("Dashboard")}
                  >
                    ← Back to Dashboard
                  </button>
                </>
              )}
            </section>
          )}

          {/* CHANGE PASSWORD */}

          {activeSection === "Change Password" && (
            <section className="employee-section-card">
              <h2>Change Password</h2>
              <p style={descriptionStyle}>
                For your account security, enter your current password
                and choose a new password.
              </p>

              <form
                className="employee-edit-form"
                onSubmit={handlePasswordSubmit}
              >
                <div className="employee-form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                {passwordMessage && (
                  <p
                    style={{
                      color: passwordError ? "#dc2626" : "#15803d",
                      gridColumn: "1 / -1",
                    }}
                  >
                    {passwordMessage}
                  </p>
                )}

                <div className="employee-form-actions">
                  <button type="submit">Update Password</button>
                  <button
                    type="button"
                    className="employee-cancel-button"
                    onClick={() => navigateTo("Dashboard")}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* APPLY FOR LEAVE */}

          {activeSection === "Apply for Leave" && (
            <section className="employee-section-card">
              <h2>
                {editingLeaveRequestId
                  ? "Edit Leave Request"
                  : "Apply for Leave"}
              </h2>

              <p style={descriptionStyle}>
                {editingLeaveRequestId
                  ? "Update the details of your pending leave application."
                  : "Complete the form below to submit your leave application."}
              </p>

              {leaveSuccessMessage && (
                <div style={successMessageStyle}>
                  {leaveSuccessMessage}
                  <button
                    type="button"
                    onClick={() => navigateTo("My Leave Requests")}
                    style={successLinkStyle}
                  >
                    View My Requests →
                  </button>
                </div>
              )}

              <form onSubmit={handleApplyLeave} style={leaveFormStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Employee ID</label>
                  <input
                    value={employee.employeeId}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Employee Name</label>
                  <input
                    value={employee.employeeName}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    style={formInputStyle}
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Earned Leave</option>
                    <option>Personal Leave</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Start Date</label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={formInputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>End Date</label>
                  <input
                    type="date"
                    min={startDate || getTodayDate()}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={formInputStyle}
                  />
                </div>

                {startDate && endDate && endDate >= startDate && (
                  <div style={formGroupStyle}>
                    <label style={formLabelStyle}>Total Leave Days</label>
                    <input
                      value={`${calculateLeaveDays(startDate, endDate)} day(s)`}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>
                )}

                <div style={{ ...formGroupStyle, gridColumn: "1 / -1" }}>
                  <label style={formLabelStyle}>Reason for Leave</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter your reason for requesting leave"
                    rows="4"
                    required
                    style={{ ...formInputStyle, resize: "vertical" }}
                  />
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button type="submit" style={submitLeaveButtonStyle}>
                    {editingLeaveRequestId
                      ? "Save Changes"
                      : "Submit Leave Application"}
                  </button>

                  {editingLeaveRequestId && (
                    <button
                      type="button"
                      onClick={handleCancelLeaveEdit}
                      style={cancelLeaveButtonStyle}
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* MY LEAVE REQUESTS */}

          {activeSection === "My Leave Requests" && (
            <section className="employee-section-card">
              <h2>My Leave Requests</h2>
              <p style={descriptionStyle}>
                Track all your leave applications and their current status.
              </p>

              {myLeaveRequests.length === 0 ? (
                <div style={emptyStateStyle}>
                  <h3>No Leave Requests Found</h3>
                  <p>You have not submitted any leave applications yet.</p>
                  <button
                    type="button"
                    onClick={() => navigateTo("Apply for Leave")}
                    style={submitLeaveButtonStyle}
                  >
                    Apply for Leave
                  </button>
                </div>
              ) : (
                <div style={leaveTableWrapperStyle}>
                  <table style={leaveTableStyle}>
                    <thead>
                      <tr>
                        {[
                          "Request ID",
                          "Leave Type",
                          "From Date",
                          "To Date",
                          "Days",
                          "Reason",
                          "Applied On",
                          "Status",
                          "Actions",
                        ].map((heading) => (
                          <th key={heading} style={tableHeaderStyle}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {[...myLeaveRequests].reverse().map((request) => (
                        <tr key={request.requestId}>
                          <td style={tableCellStyle}>{request.requestId}</td>
                          <td style={tableCellStyle}>{request.leaveType}</td>
                          <td style={tableCellStyle}>
                            {formatDate(request.startDate)}
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(request.endDate)}
                          </td>
                          <td style={tableCellStyle}>{request.totalDays}</td>
                          <td style={tableCellStyle}>{request.reason}</td>
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
                            <div style={actionButtonsStyle}>
                              {request.status === "Pending" && (
                                <button
                                  type="button"
                                  title="Edit Request"
                                  aria-label="Edit Request"
                                  onClick={() => handleEditLeave(request)}
                                  style={editButtonStyle}
                                >
                                  ✎
                                </button>
                              )}

                              <button
                                type="button"
                                title="Delete Request"
                                aria-label="Delete Request"
                                onClick={() => handleDeleteLeave(request)}
                                style={deleteButtonStyle}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                className="employee-back-button"
                onClick={() => navigateTo("Dashboard")}
              >
                ← Back to Dashboard
              </button>
            </section>
          )}

          {/* SERVICE REQUESTS */}

          {activeSection === "Service Requests" && (
            <>
              <section className="employee-section-card">
                <h2>
                  {editingServiceRequestId
                    ? "Edit Service Request"
                    : "Submit a Service Request"}
                </h2>

                <p style={descriptionStyle}>
                  Raise a request with HR for IT support, ID cards,
                  payroll, attendance, or other employee-related services.
                </p>

                {serviceSuccessMessage && (
                  <div style={successMessageStyle}>
                    {serviceSuccessMessage}
                  </div>
                )}

                <form
                  onSubmit={handleSubmitServiceRequest}
                  style={leaveFormStyle}
                >
                  <div style={formGroupStyle}>
                    <label style={formLabelStyle}>Employee ID</label>
                    <input
                      value={employee.employeeId}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={formLabelStyle}>Employee Name</label>
                    <input
                      value={employee.employeeName}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={formLabelStyle}>Request Category</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      style={formInputStyle}
                      required
                    >
                      <option value="IT Support">IT Support</option>
                      <option value="ID Card">ID Card</option>
                      <option value="Payroll/Salary">Payroll/Salary</option>
                      <option value="Attendance">Attendance</option>
                      <option value="HR/Personal">HR/Personal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={formLabelStyle}>Subject</label>
                    <input
                      type="text"
                      value={serviceSubject}
                      onChange={(e) => setServiceSubject(e.target.value)}
                      placeholder="Enter request subject"
                      maxLength="100"
                      required
                      style={formInputStyle}
                    />
                  </div>

                  <div style={{ ...formGroupStyle, gridColumn: "1 / -1" }}>
                    <label style={formLabelStyle}>Description</label>
                    <textarea
                      value={serviceDescription}
                      onChange={(e) =>
                        setServiceDescription(e.target.value)
                      }
                      placeholder="Explain your request in detail..."
                      rows="4"
                      maxLength="1000"
                      required
                      style={{ ...formInputStyle, resize: "vertical" }}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button type="submit" style={submitLeaveButtonStyle}>
                      {editingServiceRequestId
                        ? "Save Changes"
                        : "Submit Service Request"}
                    </button>

                    {editingServiceRequestId && (
                      <button
                        type="button"
                        onClick={handleCancelServiceEdit}
                        style={cancelLeaveButtonStyle}
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section
                className="employee-section-card"
                style={{ marginTop: "25px" }}
              >
                <h2>My Service Requests</h2>

                <p style={descriptionStyle}>
                  Track your submitted requests and check the responses
                  from HR.
                </p>

                {myServiceRequests.length === 0 ? (
                  <div style={emptyStateStyle}>
                    <h3>No Service Requests Found</h3>
                    <p>
                      You have not submitted any service requests yet.
                    </p>
                  </div>
                ) : (
                  <div style={leaveTableWrapperStyle}>
                    <table style={serviceTableStyle}>
                      <thead>
                        <tr>
                          {[
                            "Request ID",
                            "Category",
                            "Subject",
                            "Description",
                            "Submitted On",
                            "Status",
                            "HR Response",
                            "Actions",
                          ].map((heading) => (
                            <th key={heading} style={tableHeaderStyle}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {[...myServiceRequests].reverse().map((request) => (
                          <tr key={request.requestId}>
                            <td style={tableCellStyle}>
                              {request.requestId}
                            </td>

                            <td style={tableCellStyle}>
                              {request.category}
                            </td>

                            <td style={tableCellStyle}>
                              {request.subject}
                            </td>

                            <td
                              style={{
                                ...tableCellStyle,
                                minWidth: "200px",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {request.description}
                            </td>

                            <td style={tableCellStyle}>
                              {formatDateTime(request.createdAt)}
                            </td>

                            <td style={tableCellStyle}>
                              <span
                                style={serviceStatusStyle(request.status)}
                              >
                                {request.status || "Pending"}
                              </span>
                            </td>

                            <td
                              style={{
                                ...tableCellStyle,
                                minWidth: "180px",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {request.hrResponse || "Awaiting HR response"}
                            </td>

                            <td style={tableCellStyle}>
                              <div style={actionButtonsStyle}>
                                {/* Edit is available only for Pending requests. */}
                                {request.status === "Pending" && (
                                  <button
                                    type="button"
                                    title="Edit Request"
                                    aria-label="Edit Request"
                                    onClick={() =>
                                      handleEditServiceRequest(request)
                                    }
                                    style={editButtonStyle}
                                  >
                                    ✎
                                  </button>
                                )}

                                {/* Delete is available for every request status. */}
                                <button
                                  type="button"
                                  title="Delete Request"
                                  aria-label="Delete Request"
                                  onClick={() =>
                                    handleDeleteServiceRequest(request)
                                  }
                                  style={deleteButtonStyle}
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  type="button"
                  className="employee-back-button"
                  onClick={() => navigateTo("Dashboard")}
                >
                  ← Back to Dashboard
                </button>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// STYLES

const notificationBadgeStyle = {
  marginLeft: "auto",
  background: "#dc2626",
  color: "white",
  borderRadius: "20px",
  padding: "2px 8px",
  fontSize: "12px",
};

const descriptionStyle = {
  color: "#64748b",
  marginBottom: "20px",
  lineHeight: "1.6",
};

const subHeadingStyle = {
  gridColumn: "1 / -1",
  color: "#334155",
  fontSize: "16px",
  margin: "12px 0 0",
  paddingBottom: "10px",
  borderBottom: "1px solid #e2e8f0",
};

const leaveFormStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginTop: "20px",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const formLabelStyle = {
  fontWeight: "600",
  fontSize: "14px",
  color: "#334155",
};

const formInputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "14px",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const readOnlyInputStyle = {
  ...formInputStyle,
  background: "#f1f5f9",
  color: "#475569",
};

const submitLeaveButtonStyle = {
  background: "#2563eb",
  color: "white",
  padding: "11px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const cancelLeaveButtonStyle = {
  background: "#64748b",
  color: "white",
  padding: "11px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const actionButtonsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const editButtonStyle = {
  border: "none",
  background: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: "5px",
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: "17px",
};

const deleteButtonStyle = {
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: "5px",
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: "15px",
};

const successMessageStyle = {
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
  borderRadius: "7px",
  padding: "13px",
  margin: "15px 0",
  lineHeight: "1.6",
};

const successLinkStyle = {
  display: "block",
  marginTop: "8px",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#166534",
  fontWeight: "600",
  cursor: "pointer",
};

const emptyStateStyle = {
  padding: "35px 15px",
  textAlign: "center",
  background: "#f8fafc",
  borderRadius: "8px",
  marginTop: "20px",
};

const leaveTableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  marginTop: "20px",
};

const leaveTableStyle = {
  width: "100%",
  minWidth: "1000px",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "13px",
};

const serviceTableStyle = {
  width: "100%",
  minWidth: "1250px",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "13px",
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

  const [background, color] = colors[status] || colors.Pending;

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

export default EmployeeDashboard;