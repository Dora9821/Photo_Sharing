import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";

const SERVER = "https://jx842f-8081.csb.app";

function LoginRegister({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [regData, setRegData] = useState({
    login_name: "",
    password: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(`${SERVER}/api/admin/login`, {
        login_name: loginName,
        password: password,
      })
      .then((res) => onLoginSuccess(res.data))
      .catch((err) =>
        alert(err.response?.data || "Sai tài khoản hoặc mật khẩu")
      );
  };

  const handleRegister = (e) => {
    e.preventDefault();
    axios
      .post(`${SERVER}/api/user`, regData)
      .then(() => {
        alert("Đăng ký thành công! Mời bạn đăng nhập.");
        setIsLoginView(true);
      })
      .catch((err) => alert(err.response?.data || "Lỗi đăng ký"));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      width="100%"
    >
      <ToggleButtonGroup
        value={isLoginView}
        exclusive
        onChange={(e, val) => val !== null && setIsLoginView(val)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value={true}>ĐĂNG NHẬP</ToggleButton>
        <ToggleButton value={false}>ĐĂNG KÝ</ToggleButton>
      </ToggleButtonGroup>

      <Paper elevation={3} sx={{ padding: 4, width: 450 }}>
        {isLoginView ? (
          <form onSubmit={handleLogin}>
            <Typography
              variant="h5"
              color="primary"
              align="center"
              gutterBottom
            >
              Đăng nhập
            </Typography>
            <TextField
              label="Tên đăng nhập"
              fullWidth
              margin="normal"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              VÀO HỆ THỐNG
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <Typography
              variant="h5"
              sx={{ color: "#9c27b0", textAlign: "center", mb: 2 }}
            >
              Đăng ký thành viên
            </Typography>
            <TextField
              label="Tên đăng nhập *"
              fullWidth
              margin="dense"
              required
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setRegData({ ...regData, login_name: e.target.value })
              }
            />
            <TextField
              label="Mật khẩu *"
              type="password"
              fullWidth
              margin="dense"
              required
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setRegData({ ...regData, password: e.target.value })
              }
            />
            <Box display="flex" gap={2} mt={1}>
              <TextField
                label="Họ *"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setRegData({ ...regData, first_name: e.target.value })
                }
              />
              <TextField
                label="Tên *"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setRegData({ ...regData, last_name: e.target.value })
                }
              />
            </Box>
            <TextField
              label="Nghề nghiệp"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setRegData({ ...regData, occupation: e.target.value })
              }
            />
            <TextField
              label="Địa chỉ"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setRegData({ ...regData, location: e.target.value })
              }
            />
            <TextField
              label="Mô tả"
              fullWidth
              margin="dense"
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setRegData({ ...regData, description: e.target.value })
              }
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, py: 1.5, backgroundColor: "#9c27b0" }}
              fullWidth
            >
              ĐĂNG KÝ NGAY
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}

export default LoginRegister;
