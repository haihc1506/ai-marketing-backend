// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { generateScript } = require("./services/aiService");
const XLSX = require("xlsx"); // Thư viện Excel
const path = require("path"); // Thư viện xử lý đường dẫn file

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình Multer để lưu video tạm thời
const upload = multer({ dest: "uploads/" });

const { saveToGoogleSheet } = require('./services/sheetService'); // Thêm dòng này

// API Endpoint: Nhận video và thông tin từ Frontend
app.post("/api/generate-script", upload.single("video"), async (req, res) => {
  try {
    const { productName, targetAudience, usp, tone, socialNetwork } = req.body;
    const videoPath = req.file.path;

    // Đọc file video thành dạng Buffer để gửi lên Gemini
    // Lưu ý: Gemini 1.5 Flash chấp nhận file < 20MB qua cách này.
    // Với file lớn hơn cần dùng File API (sẽ nâng cấp sau).
    const videoData = {
      inlineData: {
        data: fs.readFileSync(videoPath).toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    console.log("Đang gửi yêu cầu tới Gemini...");

    // Gọi hàm xử lý AI
    const scriptJson = await generateScript(
      socialNetwork,
      productName,
      targetAudience,
      usp,
      tone,
      videoData
    );

    saveToGoogleSheet({
      productName,
      targetAudience,
      socialNetwork,
      tone,
      aiResult: scriptJson,
    });
    // -------------------------

    // Xóa file tạm sau khi xử lý xong
    fs.unlinkSync(videoPath);

    // Trả kết quả về cho Frontend
    res.json(scriptJson);
  } catch (error) {
    console.error("Lỗi Server:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));
