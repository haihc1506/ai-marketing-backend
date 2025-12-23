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

// Hàm ghi dữ liệu vào Excel
// const saveToExcel = (data) => {
//   const filePath = path.join(__dirname, "history.xlsx"); // File sẽ nằm cùng cấp với server.js
//   let workbook;
//   let worksheet;
//   let existingData = [];

//   // Kiểm tra file đã tồn tại chưa
//   if (fs.existsSync(filePath)) {
//     // Nếu có rồi: Đọc file cũ lên
//     workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     worksheet = workbook.Sheets[sheetName];
//     existingData = XLSX.utils.sheet_to_json(worksheet);
//   } else {
//     // Nếu chưa có: Tạo workbook mới
//     workbook = XLSX.utils.book_new();
//   }

//   // Thêm dữ liệu mới vào danh sách
//   // Chuẩn bị dòng dữ liệu mới cho đẹp
//   const newRow = {
//     "Thời gian": new Date().toLocaleString("vi-VN"),
//     "Sản phẩm": data.productName,
//     "Khách hàng": data.targetAudience,
//     "Nền tảng": data.socialNetwork,
//     "Phong cách": data.tone,
//     "Hook (3s)": data.aiResult.hook_sentence,
//     "Nội dung chính": data.aiResult.body_script,
//     CTA: data.aiResult.cta,
//     Hashtags: Array.isArray(data.aiResult.caption_hashtags)
//       ? data.aiResult.caption_hashtags.join(", ")
//       : data.aiResult.caption_hashtags,
//   };

//   existingData.push(newRow);

//   // Chuyển lại thành Sheet và ghi đè vào file
//   const newWorksheet = XLSX.utils.json_to_sheet(existingData);

//   // Nếu là file mới thì tạo sheet mới, nếu cũ thì thay thế sheet cũ
//   if (workbook.SheetNames.length === 0) {
//     XLSX.utils.book_append_sheet(workbook, newWorksheet, "KichBan");
//   } else {
//     workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
//   }

//   // Lưu file
//   XLSX.writeFile(workbook, filePath);
//   console.log("✅ Đã lưu vào file history.xlsx");
// };

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

    // --- ĐOẠN MỚI THÊM VÀO ---
    // Lưu vào Excel ngay lập tức
    // saveToExcel({
    //   productName,
    //   targetAudience,
    //   socialNetwork,
    //   tone,
    //   aiResult: scriptJson,
    // });

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
