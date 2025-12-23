const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

// Khởi tạo Gemini API
// Lưu ý: Nên lưu API KEY trong biến môi trường (.env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cấu hình Model với JSON Schema (Kỹ thuật 3B: Structured Output)
// Việc định nghĩa Schema giúp đảm bảo AI LUÔN trả về đúng định dạng
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // <-- Model mới từ danh sách của bạn
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        hook_sentence: { type: SchemaType.STRING },
        body_script: { type: SchemaType.STRING },
        cta: { type: SchemaType.STRING },
        caption_hashtags: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        tone_analysis: { type: SchemaType.STRING },
      },
      required: ["hook_sentence", "body_script", "cta", "caption_hashtags"],
    },
  },
});

/**
 * Hàm tạo Script bán hàng (Kỹ thuật 1: Biến Prompt thành Function)
 * @param {string} socialNetwork - Nền tảng mạng xã hội
 * @param {string} productName - Tên sản phẩm
 * @param {string} targetAudience - Khách hàng mục tiêu
 * @param {string} usp - Điểm bán hàng độc nhất
 * @param {string} tone - Giọng văn (Tone)
 * @param {object} videoData - Dữ liệu video (Buffer hoặc URI file đã upload lên Google AI FileManager)
 **/
async function generateScript(
  socialNetwork,
  productName,
  targetAudience,
  usp,
  tone,
  videoData
) {
  try {
    // Kỹ thuật 3A: System Instruction (Được lồng ghép vào prompt hoặc cấu hình model)
    const prompt = `
      Bạn là chuyên gia Marketing và Copywriting với nhiều năm kinh nghiệm tạo nội dung bán hàng trên nền tảng mạng xã hội.
      Nhiệm vụ của bạn là tạo kịch bản video bán hàng thu hút dựa trên thông tin sản phẩm và video được cung cấp.
      
      THÔNG TIN ĐẦU VÀO:
      - Tên sản phẩm: ${productName}
      - Khách hàng mục tiêu: ${targetAudience}
      - Điểm bán hàng độc nhất (USP): ${usp}
      - Giọng văn (Tone): ${tone}

      YÊU CẦU QUAN TRỌNG:
        1. Phân tích nhanh video được cung cấp để hiểu nội dung và phong cách trình bày.
        2. Tạo kịch bản video bao gồm các phần sau:
           - Câu mở đầu (Hook) trong 3 giây đầu tiên để thu hút người xem.
           - Nội dung chính (Body Script) trình bày các điểm nổi bật của sản phẩm và phải khớp với hình ảnh trong Video.
           - Kêu gọi hành động (CTA) rõ ràng, thúc đẩy người xem mua hàng hoặc tìm hiểu thêm.
           - Gợi ý caption và hashtags phù hợp để tăng tương tác trên ${socialNetwork}.
        3. Trả về kết quả dưới dạng JSON với các trường: hook_sentence, body_script, cta, caption_hashtags (dưới dạng mảng).
        Hãy đảm bảo rằng kịch bản phù hợp với nền tảng ${socialNetwork} và thu hút khách hàng mục tiêu là ${targetAudience}.
    `;

    // Kỹ thuật 3C: Multimodal Handling (Gửi kèm video và text)
    // Giả sử videoData đã được xử lý đúng định dạng của Gemini Part
    const result = await model.generateContent([prompt, videoData]);

    // Kỹ thuật 2 (Output): Trả về JSON object trực tiếp
    const responseJSON = JSON.parse(result.response.text());
    console.log("Prompt đã gửi tới AI:", prompt);
    return responseJSON;
  } catch (error) {
    console.error("Lỗi khi gọi AI:", error);
    throw error;
  }
}

// Ví dụ cách gọi hàm (Giả lập)
// generateScript("Tai nghe X", "Sinh viên", "Chống ồn giá rẻ", videoPartObject).then(console.log);

module.exports = { generateScript };
