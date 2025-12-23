const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

// URL gốc đã là /photosOfUser (khai báo bên index.js)
// Nên ở đây chỉ cần lấy /:id
router.get("/:id", async (request, response) => {
  const id = request.params.id; // Đây là ID của user mà ta muốn xem ảnh

  try {
    // 1. Kiểm tra User có tồn tại không
    const userExists = await User.findById(id);
    if (!userExists) {
      response.status(400).send("User not found");
      return;
    }

    // 2. Lấy danh sách ảnh của User đó
    const photos = await Photo.find({ user_id: id });

    // 3. Xử lý custom dữ liệu (Deep copy để sửa đổi object)
    const newPhotos = JSON.parse(JSON.stringify(photos));

    // Sử dụng Promise.all để xử lý bất đồng bộ cho mảng ảnh
    const processedPhotos = await Promise.all(
      newPhotos.map(async (photo) => {
        // Xử lý danh sách comments của từng ảnh
        photo.comments = await Promise.all(
          photo.comments.map(async (comment) => {
            // Tìm thông tin người viết comment
            const commentAuthor = await User.findById(
              comment.user_id,
              "_id first_name last_name"
            );

            // Trả về format comment mới bao gồm thông tin người dùng (user object)
            return {
              comment: comment.comment,
              date_time: comment.date_time,
              _id: comment._id,
              user: commentAuthor, // Nhúng object user vào
            };
          })
        );

        // Xóa trường __v cho sạch đẹp (tuỳ chọn)
        delete photo.__v;

        return photo;
      })
    );

    // Trả về kết quả
    response.status(200).json(processedPhotos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(400).send("Invalid User ID or Server Error");
  }
});

module.exports = router;
