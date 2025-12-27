require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { saveToGoogleSheet } = require("./services/sheetService");
const { generateScript, suggestUSP, generateAudioFPT } = require("./services/aiService");

const app = express();
app.use(cors());
app.use(express.json());

// --- CẤU HÌNH ---
const upload = multer({ dest: "uploads/" });
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// --- MIDDLEWARE BẢO VỆ ---
const checkPassword = (req, res, next) => {
  const providedPassword = req.headers["x-app-password"];
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) return next();

  if (providedPassword === correctPassword) {
    next();
  } else {
    res.status(403).json({ error: "⛔ Mật khẩu truy cập không đúng!" });
  }
};

// --- API: GỢI Ý USP ---
app.post("/api/suggest-usp", checkPassword, async (req, res) => {
  try {
    const { productName } = req.body;
    if (!productName) {
      return res.status(400).json({ error: "Vui lòng cung cấp tên sản phẩm!" });
    }
    console.log(`Đang tìm USP cho: ${productName}...`);
    const uspResult = await suggestUSP(productName);
    res.json({ usp: uspResult });
  } catch (error) {
    console.error("Lỗi Server USP:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- API: TẠO KỊCH BẢN (SCRIPT) ---
app.post(
  "/api/generate-script",
  checkPassword,
  upload.single("video"),
  async (req, res) => {
    // Biến lưu đường dẫn file tạm (để xóa sau này)
    let videoPath = null;
    
    // Biến lưu dữ liệu video gửi cho AI (mặc định là null nếu không có video)
    let videoData = null;

    try {
      // 1. XỬ LÝ VIDEO (NẾU CÓ)
      // Logic mới: Chỉ chạy khối lệnh này nếu người dùng CÓ upload video
      if (req.file) {
        console.log("📂 Phát hiện video upload. Đang xử lý...");
        videoPath = req.file.path;

        // Upload lên Google AI
        const uploadResponse = await fileManager.uploadFile(videoPath, {
          mimeType: req.file.mimetype,
          displayName: req.file.originalname,
        });

        console.log(`Upload thành công. URI: ${uploadResponse.file.uri}`);

        // Polling chờ video Active
        let file = await fileManager.getFile(uploadResponse.file.name);
        while (file.state === "PROCESSING") {
          process.stdout.write(".");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          file = await fileManager.getFile(uploadResponse.file.name);
        }

        if (file.state === "FAILED") {
          throw new Error("Google AI không thể xử lý video này.");
        }

        // Tạo object videoData
        videoData = {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        };
        console.log("\nVideo đã sẵn sàng.");
      } else {
        console.log("📝 Không có video. Chuyển sang chế độ Sáng tạo Kịch bản (Text-only).");
      }

      // 2. NHẬN DỮ LIỆU TỪ FORM
      const {
        productName,
        targetAudience,
        usp,
        tone,
        socialNetwork,
        aiModel,
        industry,
        strategies,
        personaKey,
      } = req.body;

      // Parse strategies
      let strategyArray = [];
      try {
        strategyArray = JSON.parse(strategies);
      } catch (e) {
        strategyArray = [];
      }

      console.log("Đang gọi AI viết kịch bản...");

      // 3. GỌI HÀM TẠO KỊCH BẢN
      // Lưu ý: videoData có thể là null, aiService đã xử lý việc này
      const scriptJson = await generateScript(
        socialNetwork,
        productName,
        targetAudience,
        usp,
        tone,
        aiModel,
        industry,
        strategyArray,
        personaKey,
        videoData 
      );

      // 4. LƯU VÀO GOOGLE SHEET (NẾU CÓ)
      if (saveToGoogleSheet) {
        await saveToGoogleSheet({
          productName,
          targetAudience,
          socialNetwork,
          tone,
          aiResult: scriptJson,
        });
      }

      // 5. TRẢ KẾT QUẢ
      res.json(scriptJson);

    } catch (error) {
      console.error("Lỗi Server:", error);
      res.status(500).json({ error: error.message });
    } finally {
      // 6. DỌN DẸP FILE RÁC
      if (videoPath && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log("Đã xóa file tạm trên server.");
      }
    }
  }
);

// --- API: TẠO GIỌNG ĐỌC (AUDIO) ---
app.post('/api/generate-audio', checkPassword, async (req, res) => {
    try {
        // voiceId: giọng đọc (banmai, leminh...)
        // speed: FPT nhận từ -3 đến 3. Frontend gửi số float, ta không cần convert ở đây nếu dùng logic mới,
        // NHƯNG FPT cần int. Ta cứ để mặc định 0 (bình thường), chỉnh tốc độ ở Frontend cho mượt.
        const { text, voiceId } = req.body;

        if (!text) return res.status(400).json({ error: "Thiếu nội dung text" });

        // Gọi hàm FPT
        const audioBuffer = await generateAudioFPT(text, voiceId, 0);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length
        });
        
        res.send(audioBuffer);

    } catch (error) {
        console.error("Lỗi Server Audio:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));