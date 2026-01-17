require('dotenv').config();
const readline = require('readline');

// Cấu hình đọc input từ dòng lệnh
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ LỖI: Chưa tìm thấy API KEY trong file .env");
  process.exit(1);
}

// Hàm lấy danh sách model và giới hạn của chúng
async function getModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Lỗi lấy danh sách model:", error);
    return [];
  }
}

// Hàm tính toán token cho một đoạn text cụ thể
async function countTokens(modelName, text) {
  // Lưu ý: Endpoint countTokens thêm hậu tố :countTokens
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:countTokens?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{ text: text }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data.totalTokens; // Trả về số token đã dùng
  } catch (error) {
    console.error(`Lỗi đếm token model ${modelName}:`, error);
    return null;
  }
}

async function main() {
  console.log("📡 Đang lấy thông tin models...");
  const models = await getModels();
  
  // Lọc lấy các model chat/generate phổ biến
  const chatModels = models.filter(m => 
    m.supportedGenerationMethods.includes("generateContent") &&
    (m.name.includes("flash") || m.name.includes("pro"))
  );

  if (chatModels.length === 0) {
    console.log("❌ Không tìm thấy model phù hợp.");
    process.exit(1);
  }

  console.log("\n✅ Đã tìm thấy các model. Bây giờ hãy nhập nội dung bạn muốn kiểm tra.");
  console.log("   (Ví dụ: Prompt dài bạn định gửi cho AI, hoặc nội dung file text...)");
  
  rl.question('\n📝 Nhập text của bạn: ', async (userInput) => {
    if (!userInput) {
      console.log("Bạn chưa nhập gì cả.");
      process.exit(0);
    }

    console.log("\n-------- KẾT QUẢ TÍNH TOÁN TOKEN --------");
    console.log(`Độ dài văn bản: ${userInput.length} ký tự`);
    console.log("-".repeat(80));
    console.log(`| ${"MODEL".padEnd(25)} | ${"ĐÃ DÙNG".padEnd(10)} | ${"TỔNG LIMIT".padEnd(15)} | ${"CÒN LẠI".padEnd(15)} |`);
    console.log("-".repeat(80));

    // Chạy vòng lặp kiểm tra từng model
    for (const model of chatModels) {
      const modelName = model.name.replace("models/", "");
      const inputLimit = model.inputTokenLimit;
      
      // Gọi API đếm token thực tế
      const usedTokens = await countTokens(modelName, userInput);

      if (usedTokens !== null) {
        const remaining = inputLimit - usedTokens;
        const percentUsed = ((usedTokens / inputLimit) * 100).toFixed(4); // Hiển thị 4 số thập phân vì limit rất lớn

        // Format số cho đẹp (1,000,000)
        const fmtUsed = usedTokens.toLocaleString();
        const fmtLimit = inputLimit.toLocaleString();
        const fmtRem = remaining.toLocaleString();

        console.log(`| ${modelName.padEnd(25)} | ${fmtUsed.padEnd(10)} | ${fmtLimit.padEnd(15)} | ${fmtRem.padEnd(15)} |`);
        
        // Cảnh báo nếu dùng nhiều
        if (remaining < 0) console.log(`  ⚠️ QUÁ TẢI: Bạn đã vượt quá giới hạn của model này!`);
      }
    }
    console.log("-".repeat(80));
    console.log("💡 'ĐÃ DÙNG': Số token API tính cho đoạn text này.");
    console.log("💡 'CÒN LẠI': Dung lượng bộ nhớ còn trống trong 1 request (Context Window).");
    
    rl.close();
  });
}

main();