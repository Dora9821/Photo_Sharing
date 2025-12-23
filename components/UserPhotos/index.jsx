import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Typography,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Box,
  Divider,
} from "@mui/material";

const SERVER = "https://jx842f-8081.csb.app"; // Cổng 8081 chuẩn

function UserPhotos({ currentUser }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  // 1. Tải ảnh và thông tin bình luận (Đã populate tên user từ Backend)
  const loadPhotos = () => {
    axios
      .get(`${SERVER}/api/photosOfUser/${userId}`, { withCredentials: true })
      .then((res) => setPhotos(res.data))
      .catch((err) => console.error("Lỗi tải ảnh:", err));
  };

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  // 2. Chức năng Thêm bình luận
  const handleAddComment = (photoId) => {
    const commentText = commentInputs[photoId];
    if (!commentText || !commentText.trim()) return;

    axios
      .post(
        `${SERVER}/api/commentsOfPhoto/${photoId}`,
        { comment: commentText },
        { withCredentials: true }
      )
      .then(() => {
        setCommentInputs({ ...commentInputs, [photoId]: "" });
        loadPhotos(); // Tải lại để hiện bình luận mới
      })
      .catch((err) => alert("Lỗi gửi bình luận: " + err.message));
  };

  // 3. Chức năng Xóa bình luận (Chỉ chủ nhân mới thấy nút xóa)
  const handleDeleteComment = (photoId, commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      axios
        .post(
          `${SERVER}/api/commentsOfPhoto/${photoId}/delete/${commentId}`,
          {},
          { withCredentials: true }
        )
        .then(() => loadPhotos())
        .catch((err) => alert("Không thể xóa bình luận: " + err.message));
    }
  };

  // 4. Chức năng Xóa ảnh (Chỉ chủ nhân ảnh mới thấy nút xóa)
  const handleDeletePhoto = (photoId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bức ảnh này?")) {
      axios
        .post(
          `${SERVER}/api/photos/delete/${photoId}`,
          {},
          { withCredentials: true }
        )
        .then(() => loadPhotos())
        .catch((err) => alert("Không thể xóa ảnh: " + err.message));
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Photos
      </Typography>
      <Grid container spacing={4}>
        {photos.length === 0 ? (
          <Typography variant="body1" sx={{ ml: 3, mt: 2 }}>
            Người dùng này chưa có ảnh nào.
          </Typography>
        ) : (
          photos.map((p) => (
            <Grid item xs={12} key={p._id}>
              <Card elevation={4} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title={`Đăng lúc: ${new Date(p.date_time).toLocaleString()}`}
                  action={
                    // Kiểm tra nếu là chủ nhân ảnh thì hiện nút xóa
                    currentUser._id === p.user_id && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeletePhoto(p._id)}
                      >
                        Xóa ảnh
                      </Button>
                    )
                  }
                />
                <CardMedia
                  component="img"
                  image={`${SERVER}/images/${p.file_name}`}
                  sx={{
                    maxHeight: 600,
                    objectFit: "contain",
                    bgcolor: "#f0f0f0",
                  }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                  >
                    Bình luận ({p.comments ? p.comments.length : 0})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Danh sách bình luận hiện tên chuẩn */}
                  {p.comments &&
                    p.comments.map((c) => (
                      <Box
                        key={c._id}
                        sx={{
                          mb: 2,
                          p: 1.5,
                          bgcolor: "#f9f9f9",
                          borderRadius: 2,
                          border: "1px solid #eee",
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle2"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                          >
                            {c.user
                              ? `${c.user.first_name} ${c.user.last_name}`
                              : "Ẩn danh"}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(c.date_time).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                          {c.comment}
                        </Typography>

                        {/* Chỉ hiện nút xóa nếu là người viết bình luận */}
                        {currentUser._id === c.user_id && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteComment(p._id, c._id)}
                          >
                            Xóa bình luận
                          </Button>
                        )}
                      </Box>
                    ))}

                  {/* Ô nhập bình luận mới */}
                  <Box sx={{ display: "flex", mt: 3, gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Viết bình luận của bạn..."
                      value={commentInputs[p._id] || ""}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [p._id]: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleAddComment(p._id)}
                    >
                      Gửi
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default UserPhotos;
