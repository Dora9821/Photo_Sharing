import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Divider,
} from "@mui/material";
import axios from "axios";

const SERVER = "https://jx842f-8081.csb.app";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const loadData = () => {
    axios.get(`${SERVER}/api/user/${userId}`).then((res) => {
      setUser(res.data);
      setEditData(res.data);
    });
    axios
      .get(`${SERVER}/api/admin/current`, { withCredentials: true })
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleUpdate = () => {
    // Đảm bảo URL chính xác: https://jx842f-8081.csb.app/api/user/update
    axios
      .post(`${SERVER}/api/user/update`, editData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        // res.data lúc này phải là Object người dùng, không phải HTML
        setUser(res.data);
        setIsEditing(false);
        alert("Cập nhật hồ sơ thành công!");
      })
      .catch((err) => {
        // Nếu lỗi hiện ra HTML, nghĩa là sai URL hoặc Server chưa kịp nhận API
        console.error("Lỗi chi tiết:", err.response);
        alert("Lỗi khi lưu: Vui lòng kiểm tra lại kết nối Server.");
      });
  };

  if (!user) return <Typography sx={{ p: 3 }}>Đang tải dữ liệu...</Typography>;

  const isOwner = currentUser && currentUser._id === user._id;

  return (
    <Box>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        {user.first_name} {user.last_name}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        {isEditing ? (
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Họ"
              fullWidth
              value={editData.first_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, first_name: e.target.value })
              }
            />
            <TextField
              label="Tên"
              fullWidth
              value={editData.last_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, last_name: e.target.value })
              }
            />
            <TextField
              label="Vị trí (Location)"
              fullWidth
              value={editData.location || ""}
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
            />
            <TextField
              label="Nghề nghiệp (Occupation)"
              fullWidth
              value={editData.occupation || ""}
              onChange={(e) =>
                setEditData({ ...editData, occupation: e.target.value })
              }
            />
            <TextField
              label="Mô tả bản thân"
              multiline
              rows={4}
              fullWidth
              value={editData.description || ""}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpdate}
              >
                Lưu hồ sơ
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setIsEditing(false)}
              >
                Hủy bỏ
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Thông tin cá nhân:
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Vị trí:</strong> {user.location || "Chưa cập nhật"}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Nghề nghiệp:</strong> {user.occupation || "Chưa cập nhật"}
            </Typography>
            <Typography sx={{ mt: 2, mb: 1 }}>
              <strong>Giới thiệu:</strong>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                p: 2,
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                fontStyle: "italic",
                whiteSpace: "pre-wrap",
              }}
            >
              {user.description ||
                "Người dùng này chưa viết lời giới thiệu nào."}
            </Typography>

            <Box mt={4} display="flex" gap={2}>
              <Button
                variant="contained"
                component={Link}
                to={`/photos/${user._id}`}
              >
                Xem album ảnh
              </Button>
              {isOwner && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa Profile
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default UserDetail;
