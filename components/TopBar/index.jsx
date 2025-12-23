import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const SERVER = "https://jx842f-8081.csb.app"; //

function TopBar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm xử lý Tải ảnh lên - Giữ nguyên logic ổn định
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post(`${SERVER}/api/photos/new`, formData, { withCredentials: true })
      .then(() => {
        alert("Tải ảnh lên thành công!");
        window.location.href = `#/photos/${user._id}`; //
      })
      .catch((err) => {
        alert("Lỗi tải ảnh: " + (err.response?.data || err.message));
      });
  };

  // Hàm xác định tiêu đề (Context)
  const getContextText = () => {
    if (location.pathname.startsWith("/users/")) return "Chi tiết người dùng";
    if (location.pathname.startsWith("/photos/")) return "Danh sách ảnh";
    return "";
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* Click vào tiêu đề để quay lại trang chủ (Hiện lời chào) */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Photo Sharing App - Lê Quang Lộc
        </Typography>

        {user ? (
          <Box display="flex" alignItems="center" gap={2}>
            {/* Nút Home để quay lại nhanh màn hình chào */}
            <Button color="inherit" onClick={() => navigate("/")}>
              Home
            </Button>

            <Typography variant="body1">Hi {user.first_name}</Typography>

            <Button
              variant="contained"
              component="label"
              color="secondary"
              size="small"
            >
              Add Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleUpload}
              />
            </Button>

            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={onLogout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Typography variant="body1">Vui lòng đăng nhập</Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
