// server/services/sheetService.js
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const saveToGoogleSheet = async (data) => {
  try {
    // 1. Cấu hình xác thực
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Xử lý lỗi xuống dòng
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

    // 2. Tải thông tin Sheet
    await doc.loadInfo();

    // 3. Lấy trang đầu tiên (Sheet1)
    const sheet = doc.sheetsByIndex[0];

    // 4. Kiểm tra Header (Nếu chưa có thì tạo)
    // Giúp file sheet của bạn luôn có dòng tiêu đề đẹp
    if (sheet.rowCount === 0 || !sheet.headerValues || sheet.headerValues.length === 0) {
        await sheet.setHeaderRow([
            'Thời gian', 'Nền tảng', 'Sản phẩm', 'Khách hàng', 'Hook', 'Nội dung', 'CTA', 'Hashtags'
        ]);
    }

    // 5. Thêm dòng mới
    await sheet.addRow({
      'Thời gian': new Date().toLocaleString('vi-VN'),
      'Nền tảng': data.socialNetwork,
      'Sản phẩm': data.productName,
      'Khách hàng': data.targetAudience,
      'Hook': data.aiResult.hook_sentence,
      'Nội dung': data.aiResult.body_script,
      'CTA': data.aiResult.cta,
      'Hashtags': Array.isArray(data.aiResult.caption_hashtags) 
                  ? data.aiResult.caption_hashtags.join(', ') 
                  : data.aiResult.caption_hashtags
    });

    console.log("✅ Đã lưu vào Google Sheet thành công!");

  } catch (error) {
    console.error("❌ Lỗi lưu Google Sheet:", error);
  }
};

module.exports = { saveToGoogleSheet };