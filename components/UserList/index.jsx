import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const SERVER = "https://jx842f-8081.csb.app"; // Cổng 8081 chuẩn

function UserList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const loadUsers = () => {
    axios.get(`${SERVER}/api/user/list`).then((res) => setUsers(res.data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Xóa người dùng này?")) {
      // Gọi đúng API đã sửa ở Backend
      axios
        .post(`${SERVER}/api/user/delete/${userId}`)
        .then(() => {
          alert("Xóa thành công!");
          loadUsers();
          navigate("/"); // Quay về trang chủ (lời chào)
        })
        .catch((err) => alert("Lỗi: " + err.message));
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}
      >
        Danh sách bạn bè
      </Typography>
      <List component="nav">
        {users.map((item) => (
          <React.Fragment key={item._id}>
            <ListItem
              button
              component={Link}
              to={`/users/${item._id}`}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => handleDeleteUser(e, item._id)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              }
            >
              <ListItemText primary={`${item.first_name} ${item.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
export default UserList;
