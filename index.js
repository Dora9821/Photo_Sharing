const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const User = require("./db/userModel.js");
const Photo = require("./db/photoModel.js");

mongoose.connect(process.env.DB_URL).then(() => console.log("DB Connected"));

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.set("trust proxy", 1);
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: true, sameSite: "none" },
  })
);

app.use("/images", express.static("public/images"));

// --- API CẬP NHẬT HỒ SƠ (ĐÃ SỬA LỖI LƯU) ---
// --- CHỈ THAY THẾ API UPDATE TRONG index.js ---
app.post("/api/user/update", async (req, res) => {
  try {
    // Kiểm tra session trước khi xử lý
    if (!req.session || !req.session.user) {
      return res.status(401).send("Unauthorized");
    }

    const userId = req.session.user._id;
    const { location, description, occupation, first_name, last_name } =
      req.body;

    // Cập nhật vào Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { location, description, occupation, first_name, last_name } },
      { new: true }
    );

    // Lưu lại vào session và phản hồi
    req.session.user = updatedUser;
    req.session.save((err) => {
      if (err) return res.status(500).send("Lỗi lưu session");
      res.status(200).json(updatedUser); // Trả về JSON chuẩn
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- CÁC API KHÁC GIỮ NGUYÊN 100% ---
app.post("/api/user", async (req, res) => {
  try {
    const exist = await User.findOne({ login_name: req.body.login_name });
    if (exist) return res.status(400).send("Tên đăng nhập tồn tại");
    res.status(200).send(await User.create(req.body));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/admin/login", async (req, res) => {
  const user = await User.findOne({
    login_name: req.body.login_name,
    password: req.body.password,
  });
  if (!user) return res.status(400).send("Sai tài khoản");
  req.session.user = user;
  req.session.save(() => res.status(200).send(user));
});

app.get("/api/admin/current", (req, res) => {
  if (req.session.user) return res.status(200).send(req.session.user);
  res.status(401).send("Unauthorized");
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).send("OK");
  });
});

app.use((req, res, next) => {
  if (!req.session.user) return res.status(401).send("No Login");
  next();
});

app.post("/api/user/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const photos = await Photo.find({ user_id: userId });
    for (let p of photos) {
      if (fs.existsSync(`./public/images/${p.file_name}`))
        fs.unlinkSync(`./public/images/${p.file_name}`);
    }
    await Photo.deleteMany({ user_id: userId });
    await User.findByIdAndDelete(userId);
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/api/user/list", async (req, res) =>
  res.status(200).send(await User.find({}, "_id first_name last_name"))
);
app.get("/api/user/:id", async (req, res) =>
  res.status(200).send(await User.findById(req.params.id))
);

const upload = multer({ dest: "public/images/" });
app.post("/api/photos/new", upload.single("file"), async (req, res) => {
  const p = await Photo.create({
    file_name: req.file.filename,
    user_id: req.session.user._id,
    date_time: new Date(),
    comments: [],
  });
  res.status(200).send(p);
});

app.get("/api/photosOfUser/:id", async (req, res) => {
  const photos = await Photo.find({ user_id: req.params.id }).lean();
  for (let p of photos) {
    if (p.comments) {
      for (let c of p.comments)
        c.user = await User.findById(c.user_id, "_id first_name last_name");
    }
  }
  res.status(200).send(photos);
});

app.post("/api/photos/delete/:photo_id", async (req, res) => {
  const photo = await Photo.findById(req.params.photo_id);
  if (photo.user_id.toString() === req.session.user._id.toString()) {
    if (fs.existsSync(`./public/images/${photo.file_name}`))
      fs.unlinkSync(`./public/images/${photo.file_name}`);
    await Photo.deleteOne({ _id: req.params.photo_id });
    return res.status(200).send("OK");
  }
  res.status(403).send("No Permission");
});

app.post("/api/commentsOfPhoto/:photo_id", async (req, res) => {
  const photo = await Photo.findById(req.params.photo_id);
  photo.comments.push({
    comment: req.body.comment,
    user_id: req.session.user._id,
    date_time: new Date(),
  });
  await photo.save();
  res.status(200).send("OK");
});

app.post(
  "/api/commentsOfPhoto/:photo_id/delete/:comment_id",
  async (req, res) => {
    const photo = await Photo.findById(req.params.photo_id);
    const index = photo.comments.findIndex(
      (c) => c._id.toString() === req.params.comment_id
    );
    if (
      photo.comments[index].user_id.toString() ===
      req.session.user._id.toString()
    ) {
      photo.comments.splice(index, 1);
      await photo.save();
      return res.status(200).send("OK");
    }
    res.status(403).send("No Permission");
  }
);

app.listen(8081, () => console.log("Server 8081 ready"));
