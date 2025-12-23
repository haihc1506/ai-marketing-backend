// backend/checkModels.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init
    // Lấy danh sách model thực tế
    // Lưu ý: SDK hiện tại không có hàm listModels trực tiếp trên instance genAI cũ, 
    // nhưng ta có thể thử gọi API đơn giản hoặc dùng cấu hình mặc định.
    
    // Cách chuẩn để debug model name:
    console.log("Đang thử kết nối với model: gemini-1.5-flash-001...");
    const modelTest = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
    const result = await modelTest.generateContent("Hello");
    console.log("Kết nối thành công! Model 'gemini-1.5-flash-001' hoạt động tốt.");
    console.log("Phản hồi:", result.response.text());

  } catch (error) {
    console.error("Lỗi chi tiết:", error.message);
    console.log("\n--- GỢI Ý SỬA LỖI ---");
    console.log("1. Hãy thử đổi tên model thành 'gemini-pro' (bản 1.0 ổn định)");
    console.log("2. Hãy thử đổi tên model thành 'gemini-1.5-flash-latest'");
  }
}

listModels();