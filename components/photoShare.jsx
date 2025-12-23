import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import {
  Grid,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import axios from "axios";

// Import các component con
import UserList from "./UserList";
import UserDetail from "./UserDetail";
import UserPhotos from "./UserPhotos";
import LoginRegister from "./LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null, // Ban đầu chưa có ai đăng nhập
    };
  }

  // --- HÀM XỬ LÝ LOGIN (Được gọi từ LoginRegister) ---
  handleLoginSuccess = (loggedInUser) => {
    this.setState({ user: loggedInUser });
  };

  // --- HÀM XỬ LÝ LOGOUT (Problem 1) ---
  handleLogout = () => {
    axios
      .post("/admin/logout")
      .then(() => {
        this.setState({ user: null }); // Reset state -> Về màn hình Login
      })
      .catch((err) => console.error("Logout failed", err));
  };

  // --- HÀM XỬ LÝ UPLOAD ẢNH (Problem 3) ---
  handleUploadButton = (e) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file); // Tên 'file' phải khớp với multer ở backend

      axios
        .post("/photos/new", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          alert("Photo uploaded successfully!");
          // Bạn có thể reload trang hoặc cập nhật lại danh sách ảnh ở đây nếu muốn
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
          alert("Upload failed!");
        });
    }
  };

  render() {
    const { user } = this.state;

    return (
      <HashRouter>
        <div>
          <AppBar position="static" color="secondary">
            <Toolbar
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography variant="h6" color="inherit">
                Photo Share App
              </Typography>

              {/* PHẦN TOOLBAR BÊN PHẢI */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {user ? (
                  // ĐÃ ĐĂNG NHẬP
                  <>
                    <Typography variant="h6" style={{ marginRight: "20px" }}>
                      Hi {user.first_name}
                    </Typography>

                    {/* NÚT UPLOAD ẢNH */}
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginRight: "10px" }}
                      component="label"
                    >
                      Add Photo
                      <input
                        type="file"
                        hidden
                        onChange={this.handleUploadButton}
                      />
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={this.handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  // CHƯA ĐĂNG NHẬP
                  <Typography variant="h6">Please Login</Typography>
                )}
              </div>
            </Toolbar>
          </AppBar>

          <Grid container spacing={3} style={{ padding: "20px" }}>
            {/* LOGIC CHUYỂN ĐỔI GIAO DIỆN */}
            {!user ? (
              // --- VIEW 1: LOGIN / REGISTER ---
              <Grid item xs={12}>
                <Paper style={{ padding: "20px" }}>
                  <LoginRegister onLoginSuccess={this.handleLoginSuccess} />
                </Paper>
              </Grid>
            ) : (
              // --- VIEW 2: ỨNG DỤNG CHÍNH ---
              <>
                <Grid item xs={4}>
                  <Paper>
                    <UserList />
                  </Paper>
                </Grid>

                <Grid item xs={8}>
                  <Paper style={{ minHeight: "400px", padding: "10px" }}>
                    <Switch>
                      <Route
                        path="/users/:userId"
                        render={(props) => <UserDetail {...props} />}
                      />
                      <Route
                        path="/photos/:userId"
                        // Truyền currentUser xuống để UserPhotos dùng cho việc Comment
                        render={(props) => (
                          <UserPhotos {...props} currentUser={user} />
                        )}
                      />
                      <Route path="/">
                        <Typography variant="body1">
                          Welcome to your photosharing app! Click on a user to
                          start.
                        </Typography>
                      </Route>
                    </Switch>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

export default PhotoShare;
