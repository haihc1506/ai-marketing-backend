// server/listAllModels.js
require('dotenv').config();

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Chưa có API KEY trong file .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log("ang hỏi Google danh sách model...");
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ DANH SÁCH MODEL BẠN CÓ THỂ DÙNG:");
      console.log("-----------------------------------");
      // Lọc ra các model hỗ trợ generateContent
      const availableModels = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace("models/", "")); // Bỏ chữ 'models/' cho gọn
      
      availableModels.forEach(name => console.log(`- "${name}"`));
      
      console.log("-----------------------------------");
      console.log("👉 Hãy copy một trong các tên trên vào file aiService.js");
    } else {
      console.log("❌ Lỗi:", data);
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
  }
}

checkModels();