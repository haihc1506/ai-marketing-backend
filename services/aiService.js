const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const googleTTS = require("google-tts-api");
const Groq = require("groq-sdk");
const PERSONA_LIBRARY = require("../data/personas");
const axios = require("axios");
// Khởi tạo Gemini API
// Lưu ý: Nên lưu API KEY trong biến môi trường (.env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cấu hình Model với JSON Schema (Kỹ thuật 3B: Structured Output)
// Việc định nghĩa Schema giúp đảm bảo AI LUÔN trả về đúng định dạng
const jsonSchema = {
  type: SchemaType.OBJECT,
  properties: {
    hook_sentence: {
      type: SchemaType.STRING,
      description: "Câu mở đầu (Hook) thu hút sự chú ý ngay lập tức.",
    },
    body_script: {
      type: SchemaType.STRING,
      description: "Phần nội dung chính, trình bày USP và lợi ích sản phẩm.",
    },
    cta: {
      type: SchemaType.STRING,
      description:
        "Kêu gọi hành động (CTA) rõ ràng, thúc đẩy người xem thực hiện bước tiếp theo.",
    },
    caption_hashtags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Caption kèm theo video với các hashtag thịnh hành.",
    },
  },
  required: ["hook_sentence", "body_script", "cta", "caption_hashtags"],
};

// HÀM PHỤ: XÂY DỰNG CHỈ THỊ
function buildStrategyContext(industry, strategyArray) {
  let instructions = [];

  // 1. INSIGHT NGÀNH HÀNG
  if (strategyArray.includes("Insight_PriceSensitive")) {
    const context =
      industry === "RealEstate"
        ? "Thị trường bất động sản chững lại, người mua thận trọng hơn."
        : "Người tiêu dùng ngày càng nhạy cảm với giá cả do lạm phát và kinh tế khó khăn.";
    instructions.push(
      `- BỐI CẢNH: ${context} -> Tập trung vào 'Giá trị/Giá tiền', 'Tiết kiệm', 'Khuyến mãi'.`
    );
  }

  if (strategyArray.includes("Insight_Premium")) {
    instructions.push(
      "- CHIẾN LƯỢC: Nhấn mạnh 'Chất lượng cao', 'Thương hiệu uy tín', 'Trải nghiệm sang trọng'."
    );
  }

  if (strategyArray.includes("Insight_GenZ")) {
    instructions.push(
      "- CHIẾN LƯỢC: Gen Z. Dùng ngôn ngữ trẻ trung, bắt trend, nhấn mạnh tính mới lạ và trải nghiệm chia sẻ Mạng xã hội."
    );
  }

  // 2. YÊU CẦU KỸ THUẬT
  if (strategyArray.includes("Tech_StrictVideo")) {
    instructions.push(
      "QUAN TRỌNG: Kịch bản PHẢI KHỚP HOÀN TOÀN với video đã cung cấp, không được sáng tạo thêm nội dung."
    );
  } else if (strategyArray.includes("Tech_Creative")) {
    instructions.push(
      "SÁNG TẠO: Kịch bản có thể sáng tạo hơn, không cần khớp hoàn toàn với video."
    );
  }

  if (strategyArray.includes("Tech_KOC")) {
    instructions.push(
      "PHONG CÁCH KOC: Giọng văn thân thiện, gần gũi như chia sẻ từ người dùng thật. Tập trung vào trải nghiệm cá nhân."
    );
  }

  return instructions.join("\n");
}

/**
 * Hàm tạo Script bán hàng (Kỹ thuật 1: Biến Prompt thành Function)
 * @param {string} socialNetwork - Nền tảng mạng xã hội
 * @param {string} productName - Tên sản phẩm
 * @param {string} targetAudience - Khách hàng mục tiêu
 * @param {string} usp - Điểm bán hàng độc nhất
 * @param {string} tone - Giọng văn (Tone)
 * @param {string} modelName - Tên mô hình AI (ví dụ: "gemini-2.5-flash")
 * @param {string} industry - Ngành hàng
 * @param {Array} strategyArray - Mảng các chiến lược/insight đã chọn
 * @param {string} personaKey - Key của Persona mẫu đã chọn
 * @param {object} videoData - Dữ liệu video (Buffer hoặc URI file đã upload lên Google AI FileManager)
 **/
async function generateScript(
  socialNetwork,
  productName,
  targetAudience,
  usp,
  tone,
  modelName,
  industry,
  strategyArray,
  personaKey,
  videoData
) {
  if (modelName && modelName.includes("llama")) {
      // Lưu ý: Groq không xem được video, nên ta bỏ qua tham số videoData
      if (videoData) {
          console.log("⚠️ Cảnh báo: Llama 3 không xem được video. Đang chuyển sang chế độ Text-only.");
      }
      return await generateScriptWithGroq(
          socialNetwork, productName, targetAudience, usp, tone, industry, strategyArray, personaKey
      );
  }
  try {
    // 1. Xử lý Persona
    let personaContext = `- Khách hàng mục tiêu: ${targetAudience}`;
    if (
      personaKey &&
      PERSONA_LIBRARY[industry] &&
      PERSONA_LIBRARY[industry][personaKey]
    ) {
      const p = PERSONA_LIBRARY[industry][personaKey];
      personaContext = `
      KHÁCH HÀNG MỤC TIÊU (PERSONA):
      - Tên: ${p.label}
      - Insight tâm lý: ${p.desc}
      -> Yêu cầu: Viết kịch bản giải quyết đúng nỗi đau/nhu cầu này của họ.`;
    }

    // 2. Xây dựng chỉ thị chiến lược
    const complexInstruction = buildStrategyContext(industry, strategyArray);

    // 3. Chọn Model (QUAN TRỌNG: Sửa lại tên model đúng)
    // Hiện tại Google chưa có gemini-2.5-flash công khai.
    const selectedModelName = modelName || "gemini-2.5-flash";

    const model = genAI.getGenerativeModel({
      model: selectedModelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.8, // Tăng độ sáng tạo một chút
      },
    });
    if (videoData) {
      // TRƯỜNG HỢP 1: CÓ VIDEO
      promptInstruction = `
        NHIỆM VỤ: Xem video đính kèm và viết kịch bản lời thoại khớp với hành động trong video.
        YÊU CẦU QUAN TRỌNG:
        - Kịch bản PHẢI KHỚP HOÀN TOÀN với video đã cung cấp.
        - KHÔNG được sáng tạo thêm nội dung ngoài video.
        - Độ dài kịch bản: bám sát với thời lượng video.
        `;
    } else {
      // TRƯỜNG HỢP 2: KHÔNG CÓ VIDEO (SÁNG TẠO)
      promptInstruction = `
        NHIỆM VỤ: Bạn hãy TỰ SÁNG TẠO kịch bản video hoàn chỉnh.
        YÊU CẦU QUAN TRỌNG:
        - Vì không có video mẫu, bạn hãy TƯỞNG TƯỢNG và mô tả chi tiết cảnh quay (Visual) trong phần 'body_script'.
        - Ví dụ: "[Cảnh quay cận cảnh sản phẩm đang được rót ra cốc...] Lời thoại: ...".
        - Hãy đóng vai Đạo diễn hình ảnh, đề xuất các góc quay sáng tạo để làm nổi bật USP.
        `;
    }

    const prompt = `
      Bạn là Chuyên gia Content Video Short-form (${socialNetwork}) hàng đầu.
      ${promptInstruction}

      INPUT DATA:
      - Sản phẩm: ${productName}
      - Ngành hàng: ${industry}
      - USP (Điểm mạnh): ${usp}
      ${personaContext}

      CHỈ THỊ ĐẶC BIỆT (STRATEGY):
      ------------------------------------------------------------
      ${complexInstruction}
      ------------------------------------------------------------

      YÊU CẦU KỊCH BẢN:
      - Giọng văn: ${tone}
      - Phù hợp với đặc thù nền tảng ${socialNetwork}.
      - Tối ưu chuyển đổi, tập trung vào lợi ích sản phẩm.

      OUTPUT FORMAT: JSON (hook_sentence, body_script, cta, caption_hashtags).
    `;

    const inputParts = [prompt]; // Luôn có prompt (text)

    // Chỉ thêm video vào mảng NẾU biến videoData không phải null
    if (videoData) {
      inputParts.push(videoData);
    }

    console.log(
      `Đang gọi AI (${selectedModelName}) cho sản phẩm: ${productName}...`
    );
    console.log(
      `👉 Chế độ: ${
        videoData ? "CÓ VIDEO (Video-to-Text)" : "KHÔNG VIDEO (Text-to-Text)"
      }`
    );

    console.log("Promt:", inputParts);
    // 4. Gọi Gemini (Multimodal)
    const result = await model.generateContent(inputParts);

    // 5. Trả về kết quả
    const responseJSON = JSON.parse(result.response.text());
    return responseJSON;
  } catch (error) {
    console.error("❌ Lỗi AI Service:", error);
    // Có thể throw error hoặc trả về object lỗi mặc định để không crash app
    throw new Error(`AI Generation Failed: ${error.message}`);
  }
}

/**
 * Hàm gợi ý USP dựa trên tên sản phẩm
 * @param {string} productName - Tên sản phẩm
 */
async function suggestUSP(productName, modelName) {
  try {
    const selectedModel = modelName || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: selectedModel });

    const prompt = `
      Bạn là chuyên gia Marketing và Thấu hiểu sản phẩm.
      
      NHIỆM VỤ:
      Hãy phân tích sản phẩm: "${productName}"
      và đưa ra những USP (Unique Selling Points - Điểm bán hàng độc nhất) nổi bật nhất của sản phẩm này.
      
      YÊU CẦU:
      - Nếu là sản phẩm nổi tiếng: Hãy liệt kê tính năng nổi bật nhất.
      - Nếu là sản phẩm chung chung: Hãy đưa ra các điểm mạnh phổ biến mà sản phẩm này thường có.
      - Mỗi USP nên ngắn gọn, súc tích, tập trung vào lợi ích người dùng.
      - Tiếng Việt tự nhiên.
      - KHÔNG trả về markdown, chỉ trả về plain text để điền vào ô input.

      Ví dụ OUTPUT: "Chất vải 100% Cotton thoáng mát, co giãn 4 chiều, công nghệ in nano không bong tróc."
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim(); // Trả về text sạch
  } catch (error) {
    console.error("Lỗi gợi ý USP:", error);
    return "Sản phẩm chất lượng cao, giá cả hợp lý, được nhiều người tin dùng."; // Fallback nếu lỗi
  }
}
// --- HÀM RIÊNG CHO GROQ (LLAMA 3) ---
async function generateScriptWithGroq(
  socialNetwork,
  productName,
  targetAudience,
  usp,
  tone,
  industry,
  strategyArray,
  personaKey
) {
  try {
    console.log("⚡ Đang gọi Groq (Llama 3)...");

    // Xử lý Persona & Strategy cho Groq (Text-based)
    let personaText = targetAudience;
    if (personaKey && PERSONA_LIBRARY[industry]?.[personaKey]) {
      const p = PERSONA_LIBRARY[industry][personaKey];
      personaText = `${p.label} (${p.desc})`;
    }

    const strategyText = buildStrategyContext(industry, strategyArray);

    // Tạo Prompt kỹ thuật (System Prompt) để ép kiểu JSON
    const systemPrompt = `
            Bạn là Chuyên gia Content Video Short-form (${socialNetwork}) hàng đầu.
            
            Nhiệm vụ: Viết kịch bản bán hàng viral.
            OUTPUT FORMAT: Bắt buộc trả về JSON object (không có markdown) với cấu trúc:
            {
                "hook_sentence": "Câu mở đầu 3s (Tiếng Việt)",
                "body_script": "Nội dung chính, mô tả cảnh quay và lời thoại (Tiếng Việt)",
                "cta": "Lời kêu gọi hành động (Tiếng Việt)",
                "caption_hashtags": ["caption", "hashtag1", "hashtag2"]
            }
        `;

    const userPrompt = `
            Sản phẩm: ${productName}
            USP: ${usp}
            Khách hàng: ${personaText}
            Tone: ${tone}
            Ngành: ${industry}
            Chiến lược bổ sung: ${strategyText}
            
            Hãy viết kịch bản sáng tạo, hấp dẫn.
        `;

    // Gọi Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile", // Model bạn muốn dùng
      temperature: 0.7,
      response_format: { type: "json_object" }, // Ép trả về JSON chuẩn
    });

    // Parse kết quả
    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("❌ Lỗi Groq:", error);
    throw new Error("Lỗi khi gọi Groq AI.");
  }
}

async function generateAudioFromText(text) {
  try {
    console.log(`🎙️ Đang tạo audio Google TTS Free...`);

    // 1. Lấy Audio Base64 (Tự động cắt văn bản dài > 200 ký tự)
    // Google TTS Free không hỗ trợ chọn giọng (chỉ có 1 giọng mặc định)
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: "vi", // Tiếng Việt
      slow: false, // Tốc độ bình thường
      host: "https://translate.google.com",
      timeout: 10000,
      splitPunct: ",.?!", // Ngắt câu thông minh
    });

    // 2. Ghép các đoạn base64 lại thành 1 file Buffer duy nhất
    const buffers = results.map((item) => Buffer.from(item.base64, "base64"));
    const finalBuffer = Buffer.concat(buffers);

    return finalBuffer;
  } catch (error) {
    console.error("❌ Lỗi Google TTS:", error);
    throw new Error(`Audio Generation Failed: ${error.message}`);
  }
}

// --- HÀM TẠO AUDIO: ELEVENLABS (PREMIUM) ---
async function generateAudioElevenLabs(
  text,
  voiceId,
  stability = 0.5,
  similarity = 0.75
) {
  try {
    console.log(`🎙️ Gọi ElevenLabs (Voice: ${voiceId})...`);

    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Mặc định giọng Rachel

    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      data: {
        text: text,
        model_id: "eleven_multilingual_v2", // ⚠️ BẮT BUỘC để đọc tiếng Việt
        voice_settings: {
          stability: stability, // 0.1 (Phiêu) -> 1.0 (Robot)
          similarity_boost: similarity, // Độ giống giọng mẫu
        },
      },
      responseType: "arraybuffer", // Nhận dữ liệu nhị phân
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error("❌ Lỗi ElevenLabs:", error.response?.data || error.message);

    // Nếu hết tiền (Quota exceeded), ném lỗi rõ ràng
    if (error.response?.status === 401 || error.response?.status === 402) {
      throw new Error("ElevenLabs: Hết Credits hoặc sai API Key.");
    }
    throw new Error("Lỗi tạo giọng đọc ElevenLabs.");
  }
}

async function generateAudioFPT(text, voiceId, speed = 0) {
  try {
    console.log(`🎙️ Đang gọi FPT.AI (Voice: ${voiceId})...`);

    const API_KEY = process.env.FPT_API_KEY;

    // 1. Gửi yêu cầu tới FPT
    // voiceId: banmai (Nữ Bắc), lanhi (Nữ Nam), leminh (Nam Bắc)...
    // speed: -3 (chậm) đến 3 (nhanh). 0 là bình thường.
    const response = await axios.post(
      "https://api.fpt.ai/hmi/tts/v5",
      text, // Body là text raw
      {
        headers: {
          "api-key": API_KEY,
          speed: speed,
          voice: voiceId || "banmai",
          format: "mp3",
        },
      }
    );

    // 2. Kiểm tra kết quả
    // FPT trả về JSON dạng: { "async": "https://s3-hcm-r1.fptvcloud.com/..." }
    const audioUrl = response.data.async;

    if (!audioUrl) {
      throw new Error(
        "FPT không trả về đường dẫn Audio (Kiểm tra lại API Key/Quota)."
      );
    }

    console.log("🔗 FPT URL:", audioUrl);

    // 3. Tải file Audio từ URL đó về Server (để chuyển thành Buffer)
    // Cần đợi 1 chút để file được tạo xong trên server FPT (thường cực nhanh)
    await new Promise((r) => setTimeout(r, 500));

    const fileResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    return Buffer.from(fileResponse.data);
  } catch (error) {
    console.error("❌ Lỗi FPT.AI:", error.response?.data || error.message);
    throw new Error("Lỗi tạo giọng đọc FPT.AI.");
  }
}

module.exports = {
  generateScript,
  suggestUSP,
  generateAudioFromText,
  generateAudioElevenLabs,
  generateAudioFPT,
};
