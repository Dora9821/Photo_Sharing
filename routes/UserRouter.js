const express = require("express");
// QUAN TRỌNG: Kiểm tra kỹ xem trong thư mục 'db', file model tên là gì?
// Nếu file tên là 'userModel.js' thì giữ nguyên dòng dưới.
// Nếu file tên là 'user.js' hay 'schema.js' thì phải sửa lại tên cho khớp.
const User = require("../db/userModel");

const router = express.Router();

// URL: /list (Lấy danh sách user rút gọn)
router.get("/list", async (request, response) => {
  try {
    // Lấy đủ cả họ và tên
    // Bỏ tham số thứ 2 đi để nó trả về TOÀN BỘ thông tin
    const users = await User.find({});

    // Trả về JSON chuẩn
    response.status(200).json(users);
  } catch (err) {
    console.error("Error fetching user list:", err);
    // Trả về lỗi dạng JSON để frontend dễ xử lý
    response.status(500).json({ error: err.message });
  }
});

// URL: /:id (Lấy chi tiết 1 user)
router.get("/:id", async (request, response) => {
  const id = request.params.id;
  try {
    // Lấy thông tin chi tiết, trừ field __v
    const user = await User.findById(id, "-__v");

    if (!user) {
      // Nếu không tìm thấy user, trả về 404 (Not Found) thay vì 400
      return response.status(404).json({ message: "User not found" });
    }

    response.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user detail:", err);
    // Lỗi này thường do ID không đúng định dạng MongoDB
    response.status(400).json({ error: "Invalid User ID format" });
  }
});

module.exports = router;
