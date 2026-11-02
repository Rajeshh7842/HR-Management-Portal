
import { useState } from "react";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getEmptyRegistration() {
  return {
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
  };
}

function EmployeeRegistration({
  employees,
  setEmployees,
  onBack,
  onSuccess,
}) {
  const [email, setEmail] = useState("");
  const [matchedEmployee, setMatchedEmployee] = useState(null);
  const [registration, setRegistration] = useState(
    getEmptyRegistration()
  );

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setMatchedEmployee(null);

    // Clear previously entered details when the email changes.
    setRegistration(getEmptyRegistration());
  }

  function handleChange(event) {
    const { name, value } = event.target;

    let updatedValue = value;

    // Allow only digits in phone number fields.
    if (
      name === "phone" ||
      name === "emergencyContactNumber"
    ) {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setRegistration((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));
  }

  function handleEmailCheck(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      alert("Please enter your official company email.");
      return;
    }

    const employee = employees.find(
      (item) =>
        item.email?.trim().toLowerCase() === normalizedEmail
    );

    if (!employee) {
      setMatchedEmployee(null);

      alert(
        "No employee profile found. Please contact HR to create your employee profile."
      );

      return;
    }

    if (
      employee.username ||
      employee.registrationStatus === "Registered"
    ) {
      setMatchedEmployee(null);

      alert("This employee account has already been registered.");
      return;
    }

    setMatchedEmployee(employee);
  }

  function handleRegister(event) {
    event.preventDefault();

    if (!matchedEmployee) {
      alert("Please verify your company email first.");
      return;
    }

    const {
      dateOfBirth,
      gender,
      phone,
      address,
      emergencyContactName,
      emergencyContactNumber,
      username,
      password,
      confirmPassword,
    } = registration;

    if (
      !dateOfBirth ||
      !gender ||
      !phone.trim() ||
      !address.trim() ||
      !emergencyContactName.trim() ||
      !emergencyContactNumber.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // DOB must be earlier than today's date.
    if (dateOfBirth >= getTodayDate()) {
      alert("Date of Birth must be earlier than today.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      alert("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!/^\d{10}$/.test(emergencyContactNumber.trim())) {
      alert(
        "Emergency contact number must contain exactly 10 digits."
      );
      return;
    }

    const normalizedUsername = username.trim();

    if (!/^[a-zA-Z0-9]{3,20}$/.test(normalizedUsername)) {
      alert(
        "Username must contain 3–20 letters or numbers without spaces."
      );
      return;
    }

    const usernameExists = employees.some(
      (employee) =>
        employee.username?.toLowerCase() ===
          normalizedUsername.toLowerCase() &&
        employee.employeeId !== matchedEmployee.employeeId
    );

    if (usernameExists) {
      alert("This username is already taken. Please choose another.");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const updatedEmployee = {
      ...matchedEmployee,
      dateOfBirth,
      gender,
      phone: phone.trim(),
      address: address.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactNumber: emergencyContactNumber.trim(),
      username: normalizedUsername,
      password,
      mustChangePassword: false,
      registrationStatus: "Registered",
      registeredAt: new Date().toISOString(),
    };

    setEmployees((previous) =>
      previous.map((employee) =>
        employee.employeeId === matchedEmployee.employeeId
          ? updatedEmployee
          : employee
      )
    );

    alert(
      `Registration successful!\n\nEmployee ID: ${matchedEmployee.employeeId}\nYou can now log in.`
    );

    if (onSuccess) {
      onSuccess(normalizedUsername);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    fontSize: "14px",
  };

  const fieldStyle = {
    marginBottom: "15px",
  };

  const buttonStyle = {
    padding: "11px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "25px 15px",
        background: "#f3f5f9",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "550px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ textAlign: "center", marginTop: 0 }}>
          Employee Registration
        </h2>

        <p style={{ textAlign: "center", color: "#666" }}>
          Register using the official company email provided by HR.
        </p>

        <form onSubmit={handleEmailCheck}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Official Company Email
            </label>

            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your company email"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...buttonStyle,
              width: "100%",
              background: "#2563eb",
              color: "#fff",
            }}
          >
            Verify Email
          </button>
        </form>

        {matchedEmployee && (
          <>
            <div
              style={{
                marginTop: "20px",
                padding: "14px",
                background: "#eef7ff",
                borderRadius: "8px",
              }}
            >
              <strong>Employee profile found!</strong>
              <p>Employee ID: {matchedEmployee.employeeId}</p>
              <p>Name: {matchedEmployee.employeeName}</p>
              <p>Department: {matchedEmployee.department}</p>
              <p>Email: {matchedEmployee.email}</p>
            </div>

            <form onSubmit={handleRegister}>
              <h3>Personal Details</h3>

              <div style={fieldStyle}>
                <label style={labelStyle}>Date of Birth</label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={registration.dateOfBirth}
                  onChange={handleChange}
                  max={getTodayDate()}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Gender</label>

                <select
                  name="gender"
                  value={registration.gender}
                  onChange={handleChange}
                  style={inputStyle}
                  required
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

              <div style={fieldStyle}>
                <label style={labelStyle}>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={registration.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  style={inputStyle}
                  maxLength={10}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Address</label>

                <textarea
                  name="address"
                  value={registration.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  style={{ ...inputStyle, minHeight: "75px" }}
                  required
                />
              </div>

              <h3>Emergency Contact Details</h3>

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Emergency Contact Name
                </label>

                <input
                  type="text"
                  name="emergencyContactName"
                  value={registration.emergencyContactName}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Emergency Contact Number
                </label>

                <input
                  type="tel"
                  name="emergencyContactNumber"
                  value={registration.emergencyContactNumber}
                  onChange={handleChange}
                  placeholder="10-digit contact number"
                  style={inputStyle}
                  maxLength={10}
                  required
                />
              </div>

              <h3>Login Credentials</h3>

              <div style={fieldStyle}>
                <label style={labelStyle}>Username</label>

                <input
                  type="text"
                  name="username"
                  value={registration.username}
                  onChange={handleChange}
                  style={inputStyle}
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Password</label>

                <input
                  type="password"
                  name="password"
                  value={registration.password}
                  onChange={handleChange}
                  style={inputStyle}
                  minLength={8}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Confirm Password</label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={registration.confirmPassword}
                  onChange={handleChange}
                  style={inputStyle}
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  width: "100%",
                  background: "#16a34a",
                  color: "#fff",
                }}
              >
                Complete Registration
              </button>
            </form>
          </>
        )}

        <button
          type="button"
          onClick={onBack}
          style={{
            ...buttonStyle,
            width: "100%",
            marginTop: "15px",
            background: "#e5e7eb",
            color: "#222",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default EmployeeRegistration;