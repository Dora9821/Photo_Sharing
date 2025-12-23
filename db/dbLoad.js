const mongoose = require("mongoose");
require("dotenv").config();

// Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
const models = require("../modelData/models.js");

const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.log("Unable connecting to MongoDB Atlas!");
    console.error(error);
    process.exit(1); // Thoát nếu không kết nối được
  }

  // Xóa dữ liệu cũ
  await User.deleteMany({});
  await Photo.deleteMany({});
  await SchemaInfo.deleteMany({});

  // 1. NẠP USER
  const userModels = models.userListModel();
  const mapFakeId2RealId = {}; // Map để lưu ID giả -> ID thật của MongoDB

  for (const user of userModels) {
    userObj = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
      // --- THÊM MỚI CHO PROJECT FINAL ---
      // Tự động tạo login_name từ last_name viết thường (ví dụ: Ripley -> ripley)
      login_name: user.last_name.toLowerCase(),
      // Mật khẩu mặc định cho tất cả user mẫu là "123"
      password: "123",
      // ----------------------------------
    });

    try {
      await userObj.save();

      // Lưu lại ID thật để tí nữa dùng cho Photo và Comment
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;

      console.log(
        "Adding user:",
        user.first_name + " " + user.last_name,
        " with Login Name: ",
        userObj.login_name // <--- ĐÚNG: userObj (biến Mongoose) mới có
      );
    } catch (error) {
      console.error("Error create user", error);
    }
  }

  // 2. NẠP PHOTO & COMMENT
  const photoModels = [];
  const userIDs = Object.keys(mapFakeId2RealId);

  // Lấy danh sách ảnh từ dữ liệu mẫu
  userIDs.forEach(function (id) {
    photoModels.push(...models.photoOfUserModel(id));
  });

  for (const photo of photoModels) {
    let photoObj = await Photo.create({
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: mapFakeId2RealId[photo.user_id], // Dùng ID thật của User
    });

    photo.objectID = photoObj._id;

    // Xử lý comment
    if (photo.comments) {
      photo.comments.forEach(function (comment) {
        photoObj.comments = photoObj.comments.concat([
          {
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: mapFakeId2RealId[comment.user_id], // Dùng ID thật của người comment
          },
        ]);
      });
    }

    try {
      // Lưu lại lần nữa để cập nhật comments
      await photoObj.save();
      console.log(
        "Adding photo:",
        photo.file_name,
        " of user ID ",
        photoObj.user_id
      );
    } catch (error) {
      console.error("Error create photo", error);
    }
  }

  // 3. NẠP SCHEMA INFO
  try {
    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo object created with version ", schemaInfo.version);
  } catch (error) {
    console.error("Error create schemaInfo", error);
  }

  // Ngắt kết nối khi xong việc
  mongoose.disconnect();
  console.log("Done loading database.");
}

dbLoad();
