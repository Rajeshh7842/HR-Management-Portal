import { useEffect, useState } from "react";
import HRDashboard from "./HRDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import EmployeeRegistration from "./EmployeeRegistration";

function generateHRId(accounts) {
  const highestNumber = accounts.reduce((max, account) => {
    const number = parseInt(
      (account.hrId || "").replace("HR", ""),
      10
    );

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `HR${String(highestNumber + 1).padStart(3, "0")}`;
}

const defaultHRProfile = {
  name: "HR Admin",
  email: "admin@company.com",
  dateOfBirth: "",
  gender: "",
  phone: "",
  address: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
};

function Login({
  employees,
  setEmployees,
  leaveRequests,
  setLeaveRequests,
  serviceRequests,
  setServiceRequests,
}) {
  const [activeTab, setActiveTab] = useState("Login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hr");

  const [loggedInEmployee, setLoggedInEmployee] = useState(null);
  const [isHRLoggedIn, setIsHRLoggedIn] = useState(false);
  const [loggedInHR, setLoggedInHR] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hrRegistration, setHrRegistration] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [generatedHRCredentials, setGeneratedHRCredentials] =
    useState(null);

  const [hrAccounts, setHrAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrAccounts")) || [];
    } catch {
      return [];
    }
  });

  const [hrPassword, setHrPassword] = useState(
    () => localStorage.getItem("hrAdminPassword") || "admin123"
  );

  const [hrProfile, setHrProfile] = useState(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("hrAdminProfile")
      );

      return {
        ...defaultHRProfile,
        ...(savedProfile || {}),
      };
    } catch {
      return { ...defaultHRProfile };
    }
  });

  // RESTORE LOGIN SESSION AFTER REFRESH
  useEffect(() => {
    let savedSession = null;

    try {
      savedSession = JSON.parse(
        localStorage.getItem("hrLoginSession")
      );
    } catch {
      localStorage.removeItem("hrLoginSession");
    }

    if (!savedSession) return;

    // Restore Employee Session
    if (savedSession.role === "employee") {
      const employee = employees.find(
        (item) => item.employeeId === savedSession.employeeId
      );

      if (employee) {
        setLoggedInEmployee(employee);
      } else {
        localStorage.removeItem("hrLoginSession");
      }
    }

    // Restore Default HR Admin Session
    else if (savedSession.role === "admin") {
      setIsHRLoggedIn(true);
    }

    // Restore Registered HR Session
    else if (savedSession.role === "hr") {
      const hrAccount = hrAccounts.find(
        (account) => account.id === savedSession.hrId
      );

      if (hrAccount) {
        setLoggedInHR(hrAccount);
      } else {
        localStorage.removeItem("hrLoginSession");
      }
    } else {
      localStorage.removeItem("hrLoginSession");
    }
  }, []);

  const tabs = ["Login", "HR Policy", "Employee Policy", "About"];

  // LOGIN
  function handleLogin() {
    const enteredUsername = username.trim().toLowerCase();

    if (!enteredUsername || !password) {
      alert("Please enter username and password.");
      return;
    }

    if (role === "hr") {
      // DEFAULT HR ADMIN LOGIN
      if (
        enteredUsername === "admin" &&
        password === hrPassword
      ) {
        localStorage.setItem(
          "hrLoginSession",
          JSON.stringify({ role: "admin" })
        );

        setIsHRLoggedIn(true);
        return;
      }

      // REGISTERED HR LOGIN
      const hrAccount = hrAccounts.find(
        (account) =>
          account.username?.toLowerCase() === enteredUsername &&
          account.password === password
      );

      if (hrAccount) {
        localStorage.setItem(
          "hrLoginSession",
          JSON.stringify({
            role: "hr",
            hrId: hrAccount.id,
          })
        );

        setLoggedInHR(hrAccount);
        return;
      }
    }

    if (role === "employee") {
      const employee = employees.find(
        (item) =>
          item.username?.toLowerCase() === enteredUsername &&
          item.password === password
      );

      if (employee) {
        localStorage.setItem(
          "hrLoginSession",
          JSON.stringify({
            role: "employee",
            employeeId: employee.employeeId,
          })
        );

        setLoggedInEmployee(employee);
        return;
      }
    }

    alert("Invalid username or password.");
  }

  // HR SIGNUP INPUTS
  function handleHRRegistrationChange(event) {
    const { name, value } = event.target;

    setHrRegistration((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // HR SIGNUP
  function handleHRRegister(event) {
    event.preventDefault();

    const name = hrRegistration.name.trim();
    const email = hrRegistration.email.trim().toLowerCase();
    const hrUsername = hrRegistration.username.trim();
    const hrNewPassword = hrRegistration.password;
    const hrConfirmPassword = hrRegistration.confirmPassword;

    if (
      !name ||
      !email ||
      !hrUsername ||
      !hrNewPassword ||
      !hrConfirmPassword
    ) {
      alert("Please complete all HR registration fields.");
      return;
    }

    const usernamePattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/;

    if (!usernamePattern.test(hrUsername)) {
      alert(
        "HR username must contain at least one letter and one number. Only letters and numbers are allowed."
      );
      return;
    }

    const usernameExists =
      hrUsername.toLowerCase() === "admin" ||
      hrAccounts.some(
        (account) =>
          account.username?.toLowerCase() ===
          hrUsername.toLowerCase()
      );

    if (usernameExists) {
      alert("This HR username is already taken. Please choose another.");
      return;
    }

    const emailExists =
      hrAccounts.some(
        (account) => account.email?.toLowerCase() === email
      ) || hrProfile.email?.toLowerCase() === email;

    if (emailExists) {
      alert("An HR account with this email already exists.");
      return;
    }

    if (hrNewPassword.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (hrNewPassword !== hrConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const hrId = generateHRId(hrAccounts);

    const newHRAccount = {
      id: Date.now(),
      hrId,
      username: hrUsername,
      name,
      email,
      dateOfBirth: "",
      gender: "",
      phone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      password: hrNewPassword,
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...hrAccounts, newHRAccount];

    setHrAccounts(updatedAccounts);

    localStorage.setItem(
      "hrAccounts",
      JSON.stringify(updatedAccounts)
    );

    setGeneratedHRCredentials({
      hrId: newHRAccount.hrId,
      username: newHRAccount.username,
      password: newHRAccount.password,
      name: newHRAccount.name,
    });

    setHrRegistration({
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  }

  // COPY HR ACCOUNT DETAILS
  async function handleCopyHRCredentials() {
    if (!generatedHRCredentials) return;

    const credentials =
      `HR ID: ${generatedHRCredentials.hrId}\n` +
      `HR Username: ${generatedHRCredentials.username}\n` +
      `Password: ${generatedHRCredentials.password}`;

    try {
      await navigator.clipboard.writeText(credentials);
      alert("HR account details copied successfully!");
    } catch {
      alert(
        "Automatic copying failed. Please select and copy the details manually."
      );
    }
  }

  function handleCloseHRCredentials() {
    setGeneratedHRCredentials(null);
    setActiveTab("Login");
    setRole("hr");
  }

  // EMPLOYEE REGISTRATION SUCCESS
  function handleEmployeeRegistrationSuccess(registeredUsername) {
    setRole("employee");
    setUsername(registeredUsername);
    setPassword("");
    setActiveTab("Login");
  }

  // EMPLOYEE FIRST LOGIN PASSWORD CHANGE
  function handlePasswordChange(event) {
    event.preventDefault();

    if (newPassword.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (newPassword === loggedInEmployee.password) {
      alert("Choose a password different from your current password.");
      return;
    }

    const updatedEmployee = {
      ...loggedInEmployee,
      password: newPassword,
      mustChangePassword: false,
    };

    setEmployees((previous) =>
      previous.map((item) =>
        item.employeeId === updatedEmployee.employeeId
          ? updatedEmployee
          : item
      )
    );

    setLoggedInEmployee(updatedEmployee);
    setNewPassword("");
    setConfirmPassword("");

    alert("Password changed successfully!");
  }

  // LEGACY HR FIRST LOGIN PASSWORD CHANGE
  function handleHRFirstPasswordChange(event) {
    event.preventDefault();

    if (newPassword.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (newPassword === loggedInHR.password) {
      alert("Choose a password different from your current password.");
      return;
    }

    const updatedHR = {
      ...loggedInHR,
      password: newPassword,
      mustChangePassword: false,
    };

    const updatedAccounts = hrAccounts.map((account) =>
      account.id === updatedHR.id ? updatedHR : account
    );

    setHrAccounts(updatedAccounts);

    localStorage.setItem(
      "hrAccounts",
      JSON.stringify(updatedAccounts)
    );

    setLoggedInHR(updatedHR);
    setNewPassword("");
    setConfirmPassword("");

    alert("Your HR password has been changed successfully!");
  }

  // EMPLOYEE PROFILE UPDATE
  function handleUpdateEmployee(updatedEmployee) {
    setEmployees((previous) =>
      previous.map((item) =>
        item.employeeId === updatedEmployee.employeeId
          ? updatedEmployee
          : item
      )
    );

    setLoggedInEmployee(updatedEmployee);
  }

  // EMPLOYEE PASSWORD CHANGE
  function handleEmployeePasswordChange(currentPassword, updatedPassword) {
    if (loggedInEmployee.password !== currentPassword) {
      alert("Your current password is incorrect.");
      return false;
    }

    if (updatedPassword.length < 8) {
      alert("New password must contain at least 8 characters.");
      return false;
    }

    if (updatedPassword === currentPassword) {
      alert("New password must be different from your current password.");
      return false;
    }

    const updatedEmployee = {
      ...loggedInEmployee,
      password: updatedPassword,
      mustChangePassword: false,
    };

    handleUpdateEmployee(updatedEmployee);
    alert("Password changed successfully!");

    return true;
  }

  // HR PASSWORD CHANGE
  function handleHRPasswordChange(currentPassword, updatedPassword) {
    if (loggedInHR) {
      if (loggedInHR.password !== currentPassword) {
        alert("Your current HR password is incorrect.");
        return false;
      }

      if (updatedPassword.length < 8) {
        alert("New password must contain at least 8 characters.");
        return false;
      }

      if (updatedPassword === currentPassword) {
        alert("New password must be different from your current password.");
        return false;
      }

      const updatedHR = {
        ...loggedInHR,
        password: updatedPassword,
        mustChangePassword: false,
      };

      const updatedAccounts = hrAccounts.map((account) =>
        account.id === updatedHR.id ? updatedHR : account
      );

      setHrAccounts(updatedAccounts);

      localStorage.setItem(
        "hrAccounts",
        JSON.stringify(updatedAccounts)
      );

      setLoggedInHR(updatedHR);

      alert("HR password changed successfully!");
      return true;
    }

    if (currentPassword !== hrPassword) {
      alert("Your current HR password is incorrect.");
      return false;
    }

    if (updatedPassword.length < 8) {
      alert("New password must contain at least 8 characters.");
      return false;
    }

    if (updatedPassword === currentPassword) {
      alert("New password must be different from your current password.");
      return false;
    }

    setHrPassword(updatedPassword);
    localStorage.setItem("hrAdminPassword", updatedPassword);

    alert("HR password changed successfully!");

    return true;
  }

  // HR PROFILE UPDATE
  function handleUpdateHRProfile(updatedProfile) {
    if (loggedInHR) {
      // Preserve existing account details and update all profile fields.
      const updatedHR = {
        ...loggedInHR,
        ...updatedProfile,
        id: loggedInHR.id,
        hrId: loggedInHR.hrId,
        username: loggedInHR.username,
        password: loggedInHR.password,
      };

      const updatedAccounts = hrAccounts.map((account) =>
        account.id === updatedHR.id ? updatedHR : account
      );

      setHrAccounts(updatedAccounts);

      localStorage.setItem(
        "hrAccounts",
        JSON.stringify(updatedAccounts)
      );

      setLoggedInHR(updatedHR);

      alert("HR profile updated successfully!");
      return;
    }

    // Save all personal details for the default HR Admin.
    const updatedAdminProfile = {
      ...hrProfile,
      ...updatedProfile,
    };

    setHrProfile(updatedAdminProfile);

    localStorage.setItem(
      "hrAdminProfile",
      JSON.stringify(updatedAdminProfile)
    );

    alert("HR profile updated successfully!");
  }

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("hrLoginSession");

    setIsHRLoggedIn(false);
    setLoggedInHR(null);
    setLoggedInEmployee(null);
    setUsername("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRole("hr");
    setActiveTab("Login");
  }

  // DEFAULT HR DASHBOARD
  if (isHRLoggedIn) {
    return (
      <HRDashboard
        employees={employees}
        setEmployees={setEmployees}
        leaveRequests={leaveRequests}
        setLeaveRequests={setLeaveRequests}
        serviceRequests={serviceRequests}
        setServiceRequests={setServiceRequests}
        hrProfile={hrProfile}
        hrUsername="admin"
        onUpdateHRProfile={handleUpdateHRProfile}
        onChangePassword={handleHRPasswordChange}
        onLogout={handleLogout}
      />
    );
  }

  // LEGACY HR FIRST LOGIN
  if (loggedInHR && loggedInHR.mustChangePassword) {
    return (
      <div className="login-wrapper">
        <div className="login-box">
          <h1>Change HR Password</h1>

          <p>Welcome, {loggedInHR.name}!</p>

          <p>
            Please change your temporary password before accessing the HR Dashboard.
          </p>

          <form onSubmit={handleHRFirstPasswordChange}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />

            <button type="submit" className="login-button">
              Change Password
            </button>
          </form>

          <button className="login-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // NEW HR DASHBOARD
  if (loggedInHR) {
    return (
      <HRDashboard
        employees={employees}
        setEmployees={setEmployees}
        leaveRequests={leaveRequests}
        setLeaveRequests={setLeaveRequests}
        serviceRequests={serviceRequests}
        setServiceRequests={setServiceRequests}
        hrProfile={loggedInHR}
        hrUsername={loggedInHR.username}
        onUpdateHRProfile={handleUpdateHRProfile}
        onChangePassword={handleHRPasswordChange}
        onLogout={handleLogout}
      />
    );
  }

  // EMPLOYEE FIRST LOGIN
  if (loggedInEmployee && loggedInEmployee.mustChangePassword !== false) {
    return (
      <div className="login-wrapper">
        <div className="login-box">
          <h1>Change Password</h1>

          <p>Welcome, {loggedInEmployee.employeeName}!</p>

          <p>
            Please change your temporary password before continuing.
          </p>

          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />

            <button type="submit" className="login-button">
              Change Password
            </button>
          </form>

          <button className="login-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // EMPLOYEE DASHBOARD
  if (loggedInEmployee) {
    return (
      <EmployeeDashboard
        employee={loggedInEmployee}
        employees={employees}
        onUpdateEmployee={handleUpdateEmployee}
        onChangePassword={handleEmployeePasswordChange}
        leaveRequests={leaveRequests}
        setLeaveRequests={setLeaveRequests}
        serviceRequests={serviceRequests}
        setServiceRequests={setServiceRequests}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="portal-logo">
          <span>HR</span>
          <span>Portal</span>
        </div>

        <div className="nav-links">
          {tabs.map((tab) => (
            <a
              key={tab}
              href="#"
              className={activeTab === tab ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                setActiveTab(tab);
              }}
            >
              {tab}
            </a>
          ))}
        </div>
      </nav>

      {/* LOGIN */}
      {activeTab === "Login" && (
        <div className="login-wrapper">
          <div className="login-box">
            <h1>Login</h1>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <div className="user-options">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={role === "employee"}
                  onChange={(event) => setRole(event.target.value)}
                />
                Employee
              </label>

              <label>
                <input
                  type="radio"
                  name="role"
                  value="hr"
                  checked={role === "hr"}
                  onChange={(event) => setRole(event.target.value)}
                />
                HR
              </label>
            </div>

            <button className="login-button" onClick={handleLogin}>
              Login
            </button>

            <div className="signup-container">
              <p>
                <a
                  href="#"
                  className="signup-link"
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveTab("SignUp");
                  }}
                >
                  SignUp
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SIGNUP PAGE */}
      {activeTab === "SignUp" && (
        <>
          {role === "employee" ? (
            <EmployeeRegistration
              employees={employees}
              setEmployees={setEmployees}
              onBack={() => setActiveTab("Login")}
              onSuccess={handleEmployeeRegistrationSuccess}
            />
          ) : (
            <div className="login-wrapper">
              <div className="login-box">
                <h1>HR Registration</h1>

                <p>
                  Create your HR account. Choose your own username and password.
                </p>

                <form onSubmit={handleHRRegister}>
                  <input
                    type="text"
                    name="name"
                    placeholder="HR Name"
                    value={hrRegistration.name}
                    onChange={handleHRRegistrationChange}
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={hrRegistration.email}
                    onChange={handleHRRegistrationChange}
                    required
                  />

                  <input
                    type="text"
                    name="username"
                    placeholder="Choose HR Username"
                    value={hrRegistration.username}
                    onChange={handleHRRegistrationChange}
                    pattern="(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]+"
                    title="Username must contain at least one letter and one number. Only letters and numbers are allowed."
                    required
                  />

                  <p style={signupHintStyle}>
                    Your username must contain at least one letter and one number. You can choose its length.
                  </p>

                  <input
                    type="password"
                    name="password"
                    placeholder="Create Password (minimum 8 characters)"
                    value={hrRegistration.password}
                    onChange={handleHRRegistrationChange}
                    minLength={8}
                    required
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={hrRegistration.confirmPassword}
                    onChange={handleHRRegistrationChange}
                    minLength={8}
                    required
                  />

                  <button type="submit" className="login-button">
                    Create HR Account
                  </button>

                  <button
                    type="button"
                    className="login-button"
                    onClick={() => setActiveTab("Login")}
                  >
                    Back to Login
                  </button>
                </form>

                <p>
                  Already have an account?{" "}
                  <a
                    href="#"
                    className="signup-link"
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveTab("Login");
                    }}
                  >
                    Login
                  </a>
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* HR ACCOUNT DETAILS */}
      {generatedHRCredentials && (
        <div style={credentialsOverlayStyle}>
          <div style={credentialsBoxStyle}>
            <h2>HR Account Created!</h2>

            <p>
              Welcome, {generatedHRCredentials.name}.
              Your account is ready to use.
            </p>

            <label style={credentialsLabelStyle}>HR ID</label>

            <input
              style={credentialsInputStyle}
              value={generatedHRCredentials.hrId}
              readOnly
              onFocus={(event) => event.target.select()}
            />

            <label style={credentialsLabelStyle}>HR Username</label>

            <input
              style={credentialsInputStyle}
              value={generatedHRCredentials.username}
              readOnly
              onFocus={(event) => event.target.select()}
            />

            <label style={credentialsLabelStyle}>Password</label>

            <input
              style={credentialsInputStyle}
              value={generatedHRCredentials.password}
              readOnly
              onFocus={(event) => event.target.select()}
            />

            <button
              className="login-button"
              onClick={handleCopyHRCredentials}
            >
              Copy Account Details
            </button>

            <p style={{ fontSize: "13px", color: "#166534" }}>
              Your HR account is ready. You can log in using the username and password you created.
            </p>

            <button
              className="login-button"
              onClick={handleCloseHRCredentials}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}

      {/* HR POLICY */}
      {activeTab === "HR Policy" && (
        <div className="policy-container">
          <h1>HR Policy</h1>

          <div className="policy-card">
            <h3>1. Working Hours</h3>
            <p>
              Employees must follow the working hours assigned by the organisation.
            </p>
          </div>

          <div className="policy-card">
            <h3>2. Attendance Policy</h3>
            <p>
              Employees are expected to report to work on time and maintain regular attendance.
            </p>
          </div>

          <div className="policy-card">
            <h3>3. Leave Policy</h3>
            <p>
              Employees must request leave in advance and obtain approval from their reporting manager.
            </p>
          </div>

          <div className="policy-card">
            <h3>4. Code of Conduct</h3>
            <p>
              Employees must maintain professionalism, respect colleagues, and follow company guidelines.
            </p>
          </div>

          <div className="policy-card">
            <h3>5. Dress Code</h3>
            <p>
              Employees should follow the organisation's dress code and maintain a professional appearance.
            </p>
          </div>
        </div>
      )}

      {/* EMPLOYEE POLICY */}
      {activeTab === "Employee Policy" && (
        <div className="policy-container">
          <h1>Employee Policy</h1>

          <div className="policy-card">
            <h3>1. Employee Responsibilities</h3>
            <p>
              Employees must complete their assigned tasks responsibly and follow organisational guidelines.
            </p>
          </div>

          <div className="policy-card">
            <h3>2. Code of Ethics</h3>
            <p>
              Employees should demonstrate honesty, integrity, respect, and professionalism at work.
            </p>
          </div>

          <div className="policy-card">
            <h3>3. Performance and Appraisal</h3>
            <p>
              Employee performance will be reviewed periodically based on productivity, quality, and overall contribution.
            </p>
          </div>

          <div className="policy-card">
            <h3>4. Workplace Safety</h3>
            <p>
              Employees must follow workplace safety procedures and report unsafe conditions to management.
            </p>
          </div>

          <div className="policy-card">
            <h3>5. Confidentiality Policy</h3>
            <p>
              Employees must protect company information and avoid sharing confidential data without authorisation.
            </p>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {activeTab === "About" && (
        <div className="about-container">
          <h1>About HR Management Portal</h1>

          <p>
            The HR Management Portal provides a web-based interface that
            simplifies HR functions. It enables HR teams to manage employee
            records, review leave requests, and oversee onboarding.
          </p>

          <h3>Our Purpose</h3>

          <p>
            To provide a centralised platform for managing employee-related
            activities and improving HR operations.
          </p>

          <h3>Our Features</h3>

          <ul>
            <li>Employee information management</li>
            <li>HR policies and guidelines</li>
            <li>Employee policies and responsibilities</li>
            <li>Leave request management</li>
            <li>Employee service requests</li>
          </ul>
        </div>
      )}
    </>
  );
}

const signupHintStyle = {
  fontSize: "12px",
  color: "#64748b",
  textAlign: "left",
  lineHeight: "1.5",
  margin: "0 0 12px",
};

const credentialsOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 3000,
};

const credentialsBoxStyle = {
  width: "100%",
  maxWidth: "420px",
  background: "white",
  borderRadius: "12px",
  padding: "28px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
};

const credentialsLabelStyle = {
  display: "block",
  textAlign: "left",
  marginTop: "14px",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
};

const credentialsInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "600",
};

export default Login;