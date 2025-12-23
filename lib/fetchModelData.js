import axios from "axios";

/**
 * Hàm fetchModel hỗ trợ gọi API từ Backend
 * @param {string} url - Đường dẫn API (Ví dụ: "http://localhost:8081/api/user/list")
 */
function fetchModel(url) {
  // 1. In ra console đường dẫn đang gọi để kiểm tra xem có sai link không
  console.log("Đang gọi API:", url);

  // 2. Gọi axios và trả về Promise
  return axios.get(url).catch((error) => {
    // 3. Nếu lỗi, in lỗi ra console ngay lập tức để dễ sửa
    console.error("Lỗi khi gọi API tại:", url);
    console.error("Chi tiết lỗi:", error.message);

    // Ném lỗi ra ngoài để Component (UserList/UserDetail) xử lý tiếp (ví dụ hiện thông báo trống)
    throw error;
  });
}

export default fetchModel;
