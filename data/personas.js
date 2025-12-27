// Dữ liệu Persona trích xuất từ Báo cáo thị trường 2024-2030
const PERSONA_LIBRARY = {
  FMCG: {
    Budget_Shopper: {
      label: "Người Săn Hàng Giá Rẻ (Tiết kiệm)",
      desc: "Ưa chuộng các sản phẩm có giá cả phải chăng, thường xuyên săn lùng khuyến mãi và ưu đãi. Thích mua sắm tại các cửa hàng giảm giá và siêu thị lớn.",
    },
    Premium_Seeker: {
      label: "Người Ưa Chuộng Hàng Cao Cấp (Chất lượng)",
      desc: "Sẵn sàng chi trả cao hơn cho các sản phẩm chất lượng, thương hiệu uy tín. Tìm kiếm trải nghiệm mua sắm sang trọng và dịch vụ khách hàng xuất sắc.",
    },
    GenZ_TrendFollower: {
      label: "Gen Z Bắt Trend (FOMO)",
      desc: "Thích thử nghiệm các sản phẩm mới, theo kịp xu hướng và chia sẻ trải nghiệm trên mạng xã hội. Ưa chuộng các thương hiệu có hình ảnh hiện đại, năng động.",
    }, 
    Health_Conscious: {
      label: "Người Quan Tâm Sức Khỏe (Sản phẩm tốt cho sức khỏe)",
      desc: "Ưa chuộng các sản phẩm hữu cơ, tự nhiên, không chứa chất bảo quản. Chú trọng đến lợi ích sức khỏe và dinh dưỡng của sản phẩm.",
  },
    Eco_Friendly: {
      label: "Người Yêu Môi Trường (Sản phẩm xanh, sạch)",
      desc: "Ưa chuộng các sản phẩm thân thiện với môi trường, có bao bì tái chế. Hỗ trợ các thương hiệu cam kết phát triển bền vững và giảm thiểu tác động môi trường.",
    },
    Everyday_User: {
      label: "Người Dùng Hàng Ngày (Sản phẩm thiết yếu)",
      desc: "Tập trung vào các sản phẩm thiết yếu, sử dụng hàng ngày với giá cả hợp lý. Ưa chuộng sự tiện lợi và dễ dàng tiếp cận sản phẩm.",
    },
  },
  Fashion: {
    Trend_Hunter: {
      label: "Gen Z Săn Trend (Tiên phong Thời trang Nam/Nữ)",
      desc: "Luôn cập nhật xu hướng mới qua mạng xã hội (TikTok, Instagram). Quan tâm: Thiết kế độc đáo, Màu sắc nổi bật, Thương hiệu thời trang nhanh (Fast Fashion).",
    },
    Office_Elegant: {
      label: "Dân Công Sở Thanh Lịch (Thời trang Nam/Nữ)",
      desc: "Ăn mặc chỉn chu, phù hợp môi trường công sở. Quan tâm: Kiểu dáng trang nhã, Chất liệu thoáng mát, Dễ mix&match.",
    },
    Utility_Man: {
      label: "Nam Giới Thực Dụng (Thời trang Nam)",
      desc: "Ưa chuộng đồ bền, tiện dụng, đa năng. Quan tâm: Chất liệu bền bỉ, Thiết kế đơn giản, Dễ phối đồ.",
    },
    Kid_Fashion_Mom: {
      label: "Mẹ Mua Cho Bé (Thời trang Trẻ em)",
      desc: "Chọn quần áo cho con phải ưu tiên sự thoải mái, dễ vận động. Quan tâm: Chất vải mềm mịn, An toàn cho da nhạy cảm, Dễ giặt sạch.",
    },
    Shoe_Lover: {
      label: "Tín Đồ Giày Dép (Sneaker, Sandal)",
      desc: "Đam mê sưu tập giày dép theo xu hướng mới nhất. Quan tâm: Thiết kế thời thượng, Thương hiệu nổi tiếng, Độ bền và thoải mái khi mang.",
    },
    Accessory_Enthusiast: {
      label: "Người Yêu Phụ Kiện (Vòng tay, Ví, Túi)",
      desc: "Thích phối phụ kiện để làm nổi bật phong cách cá nhân. Quan tâm: Thiết kế tinh xảo, Chất liệu cao cấp, Tính ứng dụng cao.",
    },
  },

  // 2. NHÓM ĐIỆN TỬ & CÔNG NGHỆ (Điện thoại, Máy tính, Camera...)
  Tech: {
    Smartphone_Enthusiast: {
      label: "Tín Đồ Điện Thoại (Smartphone/Phụ kiện)",
      desc: "Luôn cập nhật các mẫu điện thoại mới nhất, yêu thích công nghệ hiện đại. Quan tâm: Hiệu năng mạnh mẽ, Camera chất lượng cao, Thiết kế thời thượng, Dung lượng Pin.",
  },
    Laptop_Professional: {
      label: "Dân Văn Phòng (Laptop/PC/Phụ kiện)",
      desc: "Cần laptop hiệu suất cao để làm việc và giải trí. Quan tâm: Hiệu năng ổn định, Thời lượng pin lâu, Trọng lượng nhẹ dễ mang theo.",
    },
    Camera_Hobbyist: {
      label: "Người Yêu Nhiếp Ảnh (Camera/Phụ kiện)",
      desc: "Đam mê chụp ảnh, quay video với thiết bị chất lượng. Quan tâm: Độ phân giải cao, Tính năng chuyên nghiệp, Phụ kiện hỗ trợ đa dạng.",
    },
    Home_Appliance_User: {
      label: "Người Dùng Gia Dụng (Đồ điện gia dụng)",
      desc: "Ưa chuộng các thiết bị gia dụng tiện ích, hiện đại. Quan tâm: Tiết kiệm điện năng, Dễ sử dụng, Thiết kế phù hợp không gian sống.",
    },
    Gadget_Lover: {
      label: "Tín Đồ Đồ Công Nghệ (Gadget/Thiết bị thông minh)",
      desc: "Yêu thích các thiết bị công nghệ mới lạ, tiện ích. Quan tâm: Tính năng độc đáo, Thiết kế nhỏ gọn, Dễ dàng kết nối với các thiết bị khác.",
    },
    Audio_Enthusiast: {
      label: "Người Yêu Âm Thanh (Tai nghe/Loa)",
      desc: "Đam mê trải nghiệm âm nhạc chất lượng cao. Quan tâm: Chất lượng âm thanh vượt trội, Thiết kế thoải mái khi sử dụng, Tính năng chống ồn hiệu quả.",
    },
    Smart_Home_User: {
      label: "Người Dùng Nhà Thông Minh (Thiết bị smarthome)",
      desc: "Ưa chuộng các thiết bị thông minh giúp cuộc sống tiện nghi hơn. Quan tâm: Dễ dàng điều khiển từ xa, Tính năng tự động hóa, Tương thích với nhiều nền tảng.",
    },
    Wearable_Tech_User: {
      label: "Người Dùng Thiết Bị Đeo Thông Minh (Smartwatch/Thiết bị sức khỏe)",
      desc: "Chú trọng theo dõi sức khỏe và tiện ích hàng ngày. Quan tâm: Tính năng theo dõi sức khỏe, Thời lượng pin lâu, Thiết kế thời trang.",
    },
    Gaming_Enthusiast: {
      label: "Game Thủ Chuyên Nghiệp (PC/Console/Phụ kiện)",
      desc: "Đam mê chơi game với thiết bị cấu hình cao. Quan tâm: Hiệu năng mạnh mẽ, Màn hình chất lượng cao, Phụ kiện hỗ trợ chơi game chuyên nghiệp.",
    },
    Tech_Reviewer: {
      label: "Reviewer Công Nghệ (Đánh giá sản phẩm)",
      desc: "Chuyên đánh giá, so sánh các sản phẩm công nghệ mới. Quan tâm: Tính năng nổi bật, Hiệu suất thực tế, Giá trị sử dụng.",
    },
  },

  // 3. NHÓM MẸ & BÉ + ĐỒ CHƠI
  MomBaby: {
    Safety_First_Mom: {
      label: "Mẹ Ưa An Toàn (Đồ dùng cho bé)",
      desc: "Ưu tiên sản phẩm an toàn, không độc hại cho con. Quan tâm: Chất liệu tự nhiên, Tiêu chuẩn an toàn, Đánh giá từ các mẹ khác.",
    },
    Smart_Edu_Mom: {
      label: "Mẹ Thông Minh (Đồ chơi phát triển trí tuệ)",
      desc: "Chọn đồ chơi giúp bé phát triển tư duy, kỹ năng. Quan tâm: Tính giáo dục, Độ bền, Thương hiệu uy tín.",
    },
    Fashionable_Kid_Mom: {
      label: "Mẹ Sành Điệu (Thời trang trẻ em)",
      desc: "Thích mua quần áo, phụ kiện thời trang cho con theo xu hướng. Quan tâm: Thiết kế đẹp, Chất liệu thoáng mát.",
    },
    Outdoor_Active_Kid_Mom: {
      label: "Mẹ Năng Động (Đồ chơi ngoài trời)",
      desc: "Ưa chuộng đồ chơi giúp bé vận động, khám phá thế giới bên ngoài. Quan tâm: An toàn khi sử dụng, Kích thích vận động, Dễ dàng mang theo.",
    },
    Toy_Collector: {
      label: "Người Sưu Tầm Đồ Chơi (Đồ chơi sưu tầm)",
      desc: "Đam mê sưu tầm các loại đồ chơi hiếm, độc đáo. Quan tâm: Giá trị sưu tầm, Tình trạng sản phẩm, Xu hướng thị trường.",
    },
    Toy: {
      label: "Đồ chơi phổ thông",
      desc: "Thích các loại đồ chơi phổ biến, vui nhộn. Quan tâm: Màu sắc bắt mắt, Tính giải trí, An toàn khi chơi.",
    }
  },

  // 4. NHÓM NHÀ CỬA & ĐỜI SỐNG (Giặt giũ, Bách hóa, Thú cưng...)
  HomeLife: {
    Home_Decor_Enthusiast: {
      label: "Người Yêu Trang Trí Nhà Cửa (Nội thất, Trang trí)",
      desc: "Thích làm đẹp không gian sống với các món đồ trang trí độc đáo. Quan tâm: Thiết kế thẩm mỹ, Chất liệu bền bỉ, Phong cách phù hợp xu hướng.",
  },
    Cleaning_Obsessed: {
      label: "Người Yêu Sạch Sẽ (Sản phẩm làm sạch)",
      desc: "Chú trọng giữ gìn vệ sinh nhà cửa, sử dụng sản phẩm làm sạch hiệu quả. Quan tâm: Tính năng diệt khuẩn, An toàn cho gia đình, Dễ sử dụng.",
    },
    Laundry_Fanatic: {
      label: "Người Yêu Giặt Ủi (Sản phẩm giặt giũ)",
      desc: "Quan tâm đến việc giặt giũ quần áo sạch sẽ, thơm tho. Quan tâm: Hiệu quả làm sạch, Mùi hương dễ chịu, An toàn cho da nhạy cảm.",
    },
    Grocery_Shopper: {
      label: "Người Mua Sắm Bách Hóa (Thực phẩm, Đồ dùng gia đình)",
      desc: "Thường xuyên mua sắm các mặt hàng bách hóa, thực phẩm cho gia đình. Quan tâm: Chất lượng sản phẩm, Giá cả hợp lý, Tiện lợi khi mua sắm.",
    },
    Kitchen_Gourmet: {
      label: "Tín Đồ Nhà Bếp (Dụng cụ nấu ăn)",
      desc: "Yêu thích nấu ăn và khám phá các món ăn mới. Quan tâm: Dụng cụ nấu ăn chất lượng, Tiện ích sử dụng, Thiết kế hiện đại.",
    },
  },
  Pet: {
    Pet_Lover: {
      label: "Người Yêu Thú Cưng (Thức ăn, Phụ kiện thú cưng)",
      desc: "Chăm sóc thú cưng như thành viên trong gia đình. Quan tâm: Dinh dưỡng hợp lý, Sản phẩm an toàn, Phụ kiện tiện ích.",
    },
    Pet_Health_Conscious: {
      label: "Người Quan Tâm Sức Khỏe Thú Cưng (Sản phẩm chăm sóc sức khỏe)",
      desc: "Chú trọng đến sức khỏe và sự phát triển của thú cưng. Quan tâm: Sản phẩm bổ sung dinh dưỡng, Thuốc phòng bệnh, Dịch vụ chăm sóc chuyên nghiệp.",
    },
    Pet_Fashionista: {
      label: "Người Yêu Thú Cưng Sành Điệu (Thời trang thú cưng)",
      desc: "Thích làm đẹp cho thú cưng với quần áo, phụ kiện thời trang. Quan tâm: Thiết kế đáng yêu, Chất liệu thoáng mát, Phong cách hợp xu hướng.",
    },
    Pet_Supply: {
      label: "Người Dùng Sản Phẩm Thú Cưng (Đồ dùng thiết yếu)",
      desc: "Tập trung vào các sản phẩm thiết yếu cho thú cưng hàng ngày. Quan tâm: Chất lượng sản phẩm, Giá cả hợp lý, Dễ dàng mua sắm.",
    }
  },

  // 5. NHÓM SẮC ĐẸP & SỨC KHỎE
  BeautyHealth: {
    Skincare_Holistic: {
      label: "Người Chăm Sóc Da Toàn Diện (Skincare)",
      desc: "Muốn làn da khỏe đẹp từ bên trong lẫn bên ngoài. Quan tâm: Thành phần tự nhiên, Quy trình chăm sóc da chuẩn, Review từ chuyên gia.",
    },
    Health_Conscious: {
      label: "Người Quan Tâm Sức Khỏe (Thực phẩm chức năng)",
      desc: "Ưa chuộng sản phẩm hỗ trợ sức khỏe, tăng cường đề kháng. Quan tâm: Hiệu quả đã được kiểm chứng, Thành phần an toàn, Thương hiệu uy tín.",
    },
  },

  // 6. Ô TÔ & XE MÁY
  Vehicle: {
    Bike_Lover: {
      label: "Người Yêu Xe Máy (Xe máy, Phụ kiện xe)",
      desc: "Đam mê xe máy, thích độ xe và phụ kiện cá nhân hóa. Quan tâm: Hiệu suất động cơ, Phụ kiện thời trang, An toàn khi lái xe.",
    },
  },
};

module.exports = { PERSONA_LIBRARY };