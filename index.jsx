import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import TopBar from "./components/TopBar";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import { Box, Paper, Typography } from "@mui/material";

axios.defaults.withCredentials = true;
const SERVER = "https://jx842f-8081.csb.app";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${SERVER}/admin/current`)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    axios
      .post(`${SERVER}/admin/logout`)
      .then(() => setUser(null))
      .catch(() => setUser(null));
  };

  if (loading)
    return (
      <Box p={5} textAlign="center">
        Đang tải...
      </Box>
    );

  return (
    <HashRouter>
      {!user ? (
        <LoginRegister onLoginSuccess={(u) => setUser(u)} />
      ) : (
        <>
          <TopBar user={user} onLogout={handleLogout} />
          <Box display="flex" mt={10} p={2}>
            <Box width="25%" mr={2}>
              <Paper
                elevation={3}
                sx={{ height: "calc(100vh - 120px)", overflow: "auto" }}
              >
                <UserList />
              </Paper>
            </Box>
            <Box width="75%">
              <Paper
                elevation={3}
                sx={{ height: "calc(100vh - 120px)", overflow: "auto", p: 3 }}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Box textAlign="center" mt={10}>
                        <Typography variant="h4" color="primary">
                          Xin chào, {user.first_name}!
                        </Typography>
                        <Typography
                          variant="h6"
                          color="textSecondary"
                          sx={{ mt: 2 }}
                        >
                          Hãy chọn một người từ danh sách bên trái để xem nội
                          dung.
                        </Typography>
                      </Box>
                    }
                  />
                  <Route path="/users/:userId" element={<UserDetail />} />
                  <Route
                    path="/photos/:userId"
                    element={<UserPhotos currentUser={user} />}
                  />
                </Routes>
              </Paper>
            </Box>
          </Box>
        </>
      )}
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
