// server/listAllModels.js
require('dotenv').config();

async function checkModels() {
  // Hỗ trợ đọc cả biến môi trường thường và biến Next.js
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ LỖI: Chưa tìm thấy API KEY trong file .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log("📡 Đang kết nối đến Google AI...");
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ KẾT NỐI THÀNH CÔNG! DANH SÁCH MODEL CỦA BẠN:");
      console.log("=========================================================================");
      console.log(`| ${"TÊN MODEL".padEnd(30)} | ${"INPUT LIMIT".padEnd(15)} | ${"OUTPUT LIMIT".padEnd(15)} |`);
      console.log("=========================================================================");

      // Lọc và sắp xếp
      const availableModels = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .sort((a, b) => b.inputTokenLimit - a.inputTokenLimit); // Sắp xếp theo độ mạnh (token limit)

      availableModels.forEach(m => {
        const name = m.name.replace("models/", "");
        const inputLimit = m.inputTokenLimit.toLocaleString();
        const outputLimit = m.outputTokenLimit.toLocaleString();
        
        console.log(`| ${name.padEnd(30)} | ${inputLimit.padEnd(15)} | ${outputLimit.padEnd(15)} |`);
      });
      
      console.log("=========================================================================");
      console.log("💡 Mẹo chọn Model:");
      console.log("- Tốc độ cao, rẻ: gemini-1.5-flash");
      console.log("- Thông minh, logic tốt: gemini-1.5-pro");
      console.log("- Mới nhất (Experimental): gemini-2.0-flash-exp");
    } else {
      console.log("❌ API Trả về lỗi:", data);
    }
  } catch (error) {
    console.error("❌ Lỗi kết nối mạng:", error.message);
  }
}

checkModels();