const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,
  // --- BẮT BUỘC PHẢI CÓ 2 DÒNG DƯỚI NÀY ---
  login_name: { type: String, unique: true },
  password: { type: String, default: "123" },
});

module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);
