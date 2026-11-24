import React, { useState, useEffect, useRef } from 'react';

interface Couplet {
  id: number;
  topic: string;
  location: string;
  firstClauseHan: string;
  firstClauseHV: string;
  secondClauseHan: string;
  secondClauseHV: string;
  meaning: string;
  cultureNote: string;
}

interface NomCard {
  id: number;
  char: string;
  hv: string;
  nom: string;
  pinyin: string;
  strokes: number;
  radical: string;
  meaning: string;
  context: string;
  compounds: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  isHtml?: boolean;
}

/* ==========================================
   DỮ LIỆU 30 CÂU ĐỐI HÁN NÔM CHUẨN 4 CHỦ ĐỀ
   ========================================== */
const COUPLETS_DATABASE: Couplet[] = [
  // 1. Thờ cúng Tổ tiên & Nhà thờ họ (1 -> 8)
  {
    id: 1,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Nhà thờ họ, từ đường, gian thờ gia tiên',
    firstClauseHan: '祖 宗 功 德 千 年 盛',
    firstClauseHV: 'Tổ tông công đức thiên niên thịnh',
    secondClauseHan: '子 孝 孫 賢 萬 代 榮',
    secondClauseHV: 'Tử hiếu tôn hiền vạn đại vinh',
    meaning: 'Công đức của tổ tiên ngàn năm còn hưng thịnh; Con cháu hiếu thảo, hiền tài muôn đời hưởng vinh hoa.',
    cultureNote: 'Câu đối mẫu mực và trang trọng hàng đầu tại nhà thờ họ Việt Nam, răn dạy hậu thế lấy đạo hiếu và tu đức làm gốc.'
  },
  {
    id: 2,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Từ đường dòng tộc, nhà thờ chi họ',
    firstClauseHan: '木 出 千 尋 因 有 本',
    firstClauseHV: 'Mộc xuất thiên tầm nhân hữu bản',
    secondClauseHan: '水 流 萬 里 海 由 源',
    secondClauseHV: 'Thủy lưu vạn dặm hải do nguyên',
    meaning: 'Cây vươn cao nghìn trượng nhờ có gốc rễ vững bền; Nước chảy xa vạn dặm vào biển cả cũng khởi từ nguồn suối.',
    cultureNote: 'Nhắc nhở con người ta "uống nước nhớ nguồn", làm người không được quên cội rễ tổ tiên sinh thành.'
  },
  {
    id: 3,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Gian chính điện nhà thờ họ, hoành phi đại tự',
    firstClauseHan: '德 大 教 家 成 大 業',
    firstClauseHV: 'Đức đại giáo gia thành đại nghiệp',
    secondClauseHan: '富 和 壽 奉 作 先 鋒',
    secondClauseHV: 'Phú hòa thọ phụng tác tiên phong',
    meaning: 'Đức lớn dạy dỗ gia đình nên nghiệp lớn; Giàu sang, hòa thuận và sống thọ đều nhờ noi theo nề nếp tiền nhân.',
    cultureNote: 'Đề cao giáo dục gia phong và đạo đức trong việc bồi đắp công danh sự nghiệp lâu bền cho con cháu.'
  },
  {
    id: 4,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Từ đường chi phái, bàn thờ gia tiên',
    firstClauseHan: '上 和 下 睦 家 風 美',
    firstClauseHV: 'Thượng hòa hạ mục gia phong mỹ',
    secondClauseHan: '父 慈 子 孝 世 代 榮',
    secondClauseHV: 'Phụ từ tử hiếu thế đại vinh',
    meaning: 'Trên dưới hòa thuận tạo nên gia phong tốt đẹp; Cha hiền từ, con hiếu thảo muôn đời hưởng vinh quang.',
    cultureNote: 'Chuẩn mực đạo lý gia đình truyền thống Á Đông, gia hòa thì muôn sự mới hưng vượng.'
  },
  {
    id: 5,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Cổng hoặc tiền đường từ đường dòng họ',
    firstClauseHan: '祖 堂 思 敬 千 秋 在',
    firstClauseHV: 'Tổ đường tư kính thiên thu tại',
    secondClauseHan: '族 姓 光 榮 萬 代 長',
    secondClauseHV: 'Tộc họ quang vinh vạn đại trường',
    meaning: 'Nơi nhà thờ tổ luôn ghi nhớ lòng tôn kính ngàn năm còn đó; Tên tuổi dòng họ vẻ vang bền vững muôn đời sau.',
    cultureNote: 'Thể hiện lòng biết ơn và niềm tự hào sâu sắc về truyền thống hiển hách của dòng họ.'
  },
  {
    id: 6,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Cột cái từ đường dòng tộc',
    firstClauseHan: '功 德 流 傳 千 古 盛',
    firstClauseHV: 'Công đức lưu truyền thiên cổ thịnh',
    secondClauseHan: '孝 賢 奉 養 萬 年 榮',
    secondClauseHV: 'Hiếu hiền phụng dưỡng vạn niên vinh',
    meaning: 'Công đức tổ tiên lưu truyền nghìn xưa luôn thịnh trị; Con cháu thảo hiền phụng dưỡng muôn năm rạng danh gia đình.',
    cultureNote: 'Sự kết nối giữa công đức tiền nhân tích lũy với lòng phụng dưỡng hiếu thảo của hậu duệ.'
  },
  {
    id: 7,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Nhà thờ chi họ, từ đường gia tộc',
    firstClauseHan: '尊 敬 祖 先 千 年 穩',
    firstClauseHV: 'Tôn kính tổ tiên ngàn năm vững',
    secondClauseHan: '奉 祠 家 族 萬 代 榮',
    secondClauseHV: 'Phụng thờ gia tộc muôn đời vinh',
    meaning: 'Lòng tôn kính tổ tiên nghìn năm luôn vững bền; Việc phụng thờ gia tộc muôn đời đón nhận vinh hoa.',
    cultureNote: 'Khuyên bảo con cháu trân trọng việc hương khói, giữ gìn nhà thờ tổ qua bao thế hệ.'
  },
  {
    id: 8,
    topic: 'Thờ cúng Tổ tiên',
    location: 'Bàn thờ gia tiên, phòng khách gia đình',
    firstClauseHan: '燕 喜 開 花 承 奉 業',
    firstClauseHV: 'Yến hỷ khai hoa thừa phụng nghiệp',
    secondClauseHan: '家 庭 接 福 衍 長 風',
    secondClauseHV: 'Gia đình tiếp phúc diễn trường phong',
    meaning: 'Chim yến báo tin vui khai hoa kế thừa cơ nghiệp; Mái ấm gia đình đón phúc lộc nối dài nếp sống thanh cao.',
    cultureNote: 'Lời chúc gia tộc kế thừa xứng đáng sự nghiệp tổ tông và phát triển gia phong rạng rỡ.'
  },

  // 2. Đình Chùa, Di tích & Tâm linh (9 -> 16)
  {
    id: 9,
    topic: 'Đình Chùa & Di tích',
    location: 'Cổng tam quan chùa, đại hùng bảo điện',
    firstClauseHan: '佛 法 慈 悲 普 度 迷 途 登 覺 岸',
    firstClauseHV: 'Phật pháp từ bi phổ độ mê đồ đăng giác ngạn',
    secondClauseHan: '僧 徒 弘 化 指 歸 淨 度 證 菩 提',
    secondClauseHV: 'Tăng đồ hoằng hóa chỉ quy tịnh độ chứng bồ đề',
    meaning: 'Phật pháp từ bi cứu độ chúng sinh lạc lối lên bờ giác ngộ; Chư tăng giáo hóa dẫn lối về cõi tịnh độ chứng đắc bồ đề.',
    cultureNote: 'Ý nghĩa Phật giáo nhập thế cứu độ quần sinh thoát khỏi bể khổ trầm luân nơi cõi trần.'
  },
  {
    id: 10,
    topic: 'Đình Chùa & Di tích',
    location: 'Tiền đường đình làng, đền thờ danh nhân',
    firstClauseHan: '百 世 遵 風 新 氣 象',
    firstClauseHV: 'Bách thế tuân phong tân khí tượng',
    secondClauseHan: '千 年 文 物 舊 家 風',
    secondClauseHV: 'Ngàn năm văn vật cựu gia phong',
    meaning: 'Trăm đời noi theo nề nếp tạo nên khí tượng mới mẻ; Ngàn năm văn vật lưu giữ trọn vẹn gia phong xưa.',
    cultureNote: 'Ca ngợi vẻ đẹp văn hóa ngàn năm văn hiến của làng xã và các di tích lịch sử Việt Nam.'
  },
  {
    id: 11,
    topic: 'Đình Chùa & Di tích',
    location: 'Đền thờ anh hùng liệt sĩ, di tích lịch sử',
    firstClauseHan: '永 恆 千 古 光 陰 在',
    firstClauseHV: 'Vĩnh hằng thiên cổ quang âm tại',
    secondClauseHan: '長 存 萬 代 奉 祠 靈',
    secondClauseHV: 'Trường tồn vạn đại phụng thờ thiêng',
    meaning: 'Sự nghiệp vĩnh hằng nghìn thuở cùng năm tháng sáng soi; Nơi phụng thờ linh thiêng trường tồn muôn đời cùng non sông.',
    cultureNote: 'Tôn vinh khí phách trung liệt của tiền nhân có công với đất nước.'
  },
  {
    id: 12,
    topic: 'Đình Chùa & Di tích',
    location: 'Hiên chùa, trà thất, thư phòng thanh tịnh',
    firstClauseHan: '慢 茶 待 客 心 清 靜',
    firstClauseHV: 'Mạn trà đãi khách tâm thanh tĩnh',
    secondClauseHan: '松 竹 迎 風 意 自 由',
    secondClauseHV: 'Tùng trúc nghênh phong ý tự do',
    meaning: 'Nhấp ngụm trà chậm đãi khách giữ lòng thanh tịnh; Cây tùng cây trúc đón gió tâm ý tự tại tiêu dao.',
    cultureNote: 'Triết lý thiền trà thanh tịnh, buông bỏ muộn phiền nơi chốn thiền môn.'
  },
  {
    id: 13,
    topic: 'Đình Chùa & Di tích',
    location: 'Chánh điện chùa, gian thờ Phật Tổ',
    firstClauseHan: '慈 光 普 照 三 千 界',
    firstClauseHV: 'Từ quang phổ chiếu tam thiên giới',
    secondClauseHan: '慧 日 高 懸 萬 代 明',
    secondClauseHV: 'Huệ nhật cao huyền vạn đại minh',
    meaning: 'Ánh sáng từ bi soi rọi khắp ba nghìn thế giới; Mặt trời trí tuệ treo cao chiếu sáng muôn đời muôn kiếp.',
    cultureNote: 'Tán thán công đức vô lượng và trí tuệ vô biên của Đức Phật.'
  },
  {
    id: 14,
    topic: 'Đình Chùa & Di tích',
    location: 'Cổng chùa ngày xuân, đình làng lễ hội',
    firstClauseHan: '門 多 喜 氣 春 光 滿',
    firstClauseHV: 'Môn đa hỷ khí xuân quang mãn',
    secondClauseHan: '竹 報 平 安 福 祿 多',
    secondClauseHV: 'Trúc báo bình an phúc lộc đa',
    meaning: 'Cửa đượm nhiều khí vui sắc xuân tràn ngập; Cành trúc báo tin bình an mang đến nhiều phúc lộc.',
    cultureNote: 'Lời chúc bình an, tường hòa nơi cửa Phật và cảnh sắc làng quê Việt Nam.'
  },
  {
    id: 15,
    topic: 'Đình Chùa & Di tích',
    location: 'Thiền viện, gian tịnh thất am thiền',
    firstClauseHan: '庵 清 景 靜 禪 心 定',
    firstClauseHV: 'Am thanh cảnh tĩnh thiền tâm định',
    secondClauseHan: '香 煙 沈 香 馥 禪 門',
    secondClauseHV: 'Hương khói trầm hương ngát cửa thiền',
    meaning: 'Am thanh cảnh sắc thanh tĩnh giúp tâm thiền lắng đọng; Khói hương trầm thơm ngát tỏa khắp chốn thiền môn.',
    cultureNote: 'Cảnh sắc tĩnh lặng mầu nhiệm giúp người tu tập và khách hành hương gột rửa tâm can.'
  },
  {
    id: 16,
    topic: 'Đình Chùa & Di tích',
    location: 'Cột gian giữa đại điện chùa',
    firstClauseHan: '禪 門 清 靜 除 煩 惱',
    firstClauseHV: 'Thiền môn thanh tĩnh trừ phiền não',
    secondClauseHan: '般 若 光 明 照 大 千',
    secondClauseHV: 'Bát nhã quang minh chiếu đại ngàn',
    meaning: 'Cửa thiền thanh tịnh xua tan mọi nỗi ưu phiền; Trí tuệ Bát Nhã sáng tỏ soi khắp chốn đại ngàn đại thiên.',
    cultureNote: 'Lời nhắc nhở người đến viếng chùa buông xả tham sân si để đón nhận an lạc.'
  },

  // 3. Mừng Xuân & Chúc Tết (17 -> 23)
  {
    id: 17,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Cửa chính, phòng khách ngày Tết',
    firstClauseHan: '門 迎 喜 氣 春 光 滿',
    firstClauseHV: 'Môn nghênh hỷ khí xuân quang mãn',
    secondClauseHan: '戶 納 洪 恩 福 祿 多',
    secondClauseHV: 'Hộ nạp hồng ân phúc lộc đa',
    meaning: 'Cửa đón khí vui sắc xuân tràn ngập; Nhà thu ơn lớn phúc lộc dồi dào.',
    cultureNote: 'Câu đối đón Tết cầu mong năm mới ngập tràn may mắn và phúc trạch đầy nhà.'
  },
  {
    id: 18,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Cổng nhà, văn phòng kinh doanh đầu xuân',
    firstClauseHan: '百 花 吐 豔 映 春 色',
    firstClauseHV: 'Bách hoa thổ diễm ngạn xuân sắc',
    secondClauseHan: '萬 物 迎 新 啓 泰 和',
    secondClauseHV: 'Vạn vật nghênh tân khải thái hòa',
    meaning: 'Trăm hoa đua nở khoe sắc thắm cùng cảnh xuân; Muôn vật đón mừng năm mới mở ra thời kỳ thái bình thịnh trị.',
    cultureNote: 'Cảm hứng đất trời vào xuân, ước vọng thái hòa và vạn sự khởi sắc hanh thông.'
  },
  {
    id: 19,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Phòng khách gia đình, gian chính đón Tết',
    firstClauseHan: '福 祿 壽 三 星 拱 照',
    firstClauseHV: 'Phúc lộc thọ tam tinh củng chiếu',
    secondClauseHan: '家 庭 和 萬 事 成 功',
    secondClauseHV: 'Gia đình hòa vạn sự thành công',
    meaning: 'Ba sao Phúc Lộc Thọ cùng chiếu rọi vào nhà; Cả gia đình hòa thuận thì muôn việc đều thành công.',
    cultureNote: 'Lời chúc đầu năm bao hàm trọn vẹn tam đa Phúc - Lộc - Thọ và đức tính hòa thuận của gia đình.'
  },
  {
    id: 20,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Cửa nhà, phòng khách ngày đầu năm mới',
    firstClauseHan: '年 年 如 意 春 風 至',
    firstClauseHV: 'Niên niên như ý xuân phong tới',
    secondClauseHan: '歲 歲 平 安 福 祿 歸',
    secondClauseHV: 'Tuế tuế bình an phúc lộc về',
    meaning: 'Năm nào cũng như ý khi ngọn gió xuân tràn tới; Tuổi nào cũng bình an đón rước phúc lộc tụ về.',
    cultureNote: 'Lời chúc vạn sự cát tường, bình an trường thọ qua từng mùa xuân.'
  },
  {
    id: 21,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Cổng ngõ, trước hiên nhà đón Tết',
    firstClauseHan: '迎 春 春 到 春 光 美',
    firstClauseHV: 'Đón xuân xuân đến xuân tươi thắm',
    secondClauseHan: '祝 特 特 來 特 榮 華',
    secondClauseHV: 'Chúc Tết Tết về Tết vinh hoa',
    meaning: 'Đón chào mùa xuân, xuân về mang theo cảnh sắc tươi thắm; Chúc mừng ngày Tết, Tết đến mang lại cuộc sống vinh hoa.',
    cultureNote: 'Điệp từ tươi vui rộn rã phản ánh không khí sum vầy hân hoan ngày Tết cổ truyền.'
  },
  {
    id: 22,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Gian thờ, phòng khách mừng thọ ngày Tết',
    firstClauseHan: '天 增 歲 月 人 增 壽',
    firstClauseHV: 'Thiên tăng tuế nguyệt nhân tăng thọ',
    secondClauseHan: '春 滿 乾 坤 福 滿 堂',
    secondClauseHV: 'Xuân mãn càn khôn phúc mãn đường',
    meaning: 'Trời đất thêm năm tháng con người thêm tuổi thọ; Mùa xuân ngập càn khôn, phúc đức tràn ngập ngôi nhà.',
    cultureNote: 'Câu đối chúc Tết và mừng thọ kinh điển nhất trong văn hóa Việt Nam.'
  },
  {
    id: 23,
    topic: 'Mừng Xuân & Chúc Tết',
    location: 'Trước hiên nhà, phòng khách gia trạch',
    firstClauseHan: '乾 坤 增 歲 春 增 力',
    firstClauseHV: 'Càn khôn thêm tuổi xuân thêm sức',
    secondClauseHan: '福 祿 盈 家 壽 永 春',
    secondClauseHV: 'Phúc lộc tràn nhà thọ mãi xuân',
    meaning: 'Đất trời thêm tuổi mới mùa xuân tiếp thêm sinh lực; Phúc lộc tràn đầy nhà, tuổi thọ vững bền như sắc xuân.',
    cultureNote: 'Mong ước dồi dào sức khỏe, tràn đầy sức sống và tài lộc viên mãn trong năm mới.'
  },

  // 4. Khuyên dạy Đạo đức, Tu thân & Trí tuệ (24 -> 30)
  {
    id: 24,
    topic: 'Đạo đức & Tu thân',
    location: 'Thư phòng, trường học, thư viện gia đình',
    firstClauseHan: '箴 言 教 訓 流 萬 世',
    firstClauseHV: 'Châm ngôn giáo huấn lưu vạn thế',
    secondClauseHan: '禮 義 廉 恥 養 百 年',
    secondClauseHV: 'Lễ nghĩa liêm sỉ dưỡng bách niên',
    meaning: 'Lời châm ngôn giáo huấn lưu truyền muôn đời; Bốn đức tính Lễ - Nghĩa - Liêm - Sỉ nuôi dưỡng nhân cách trăm năm.',
    cultureNote: 'Lời răn dạy sâu sắc về "tứ duy" nền tảng đạo đức của người quân tử phương Đông.'
  },
  {
    id: 25,
    topic: 'Đạo đức & Tu thân',
    location: 'Trường học, phòng học con trẻ, thư phòng',
    firstClauseHan: '先 學 禮 後 學 文',
    firstClauseHV: 'Tiên học lễ hậu học văn',
    secondClauseHan: '修 身 修 德 世 代 明',
    secondClauseHV: 'Rèn lòng giữ đức đời đời sáng',
    meaning: 'Trước hết học lễ nghi phép tắc, sau đó mới học kiến thức văn chương; Tu sửa bản thân gìn giữ đức hạnh thì đời đời rạng rỡ.',
    cultureNote: 'Triết lý giáo dục ngàn đời của Nho học Việt Nam: Đạo đức làm người phải đi trước tài năng.'
  },
  {
    id: 26,
    topic: 'Đạo đức & Tu thân',
    location: 'Phòng làm việc, văn phòng khởi nghiệp',
    firstClauseHan: '志 志 勤 勞 生 富 貴',
    firstClauseHV: 'Chí chí cần lao sinh phú quý',
    secondClauseHan: '智 智 謙 和 得 人 心',
    secondClauseHV: 'Trí trí khiêm hòa đắc nhân tâm',
    meaning: 'Chí hướng luôn chăm chỉ lao động sẽ sinh ra phú quý; Trí tuệ biết khiêm nhường hòa nhã sẽ thu phục lòng người.',
    cultureNote: 'Bí quyết lập thân lập nghiệp: Cần cù tạo nên của cải, đức khiêm nhường tạo nên uy tín.'
  },
  {
    id: 27,
    topic: 'Đạo đức & Tu thân',
    location: 'Thư viện, phòng đọc sách, nhà khách',
    firstClauseHan: '學 廣 才 高 尊 世 智',
    firstClauseHV: 'Học rộng tài cao tôn thế trí',
    secondClauseHan: '德 深 心 善 敬 家 風',
    secondClauseHV: 'Đức sâu lòng thiện kính gia phong',
    meaning: 'Học thức sâu rộng tài năng vượt bậc được thiên hạ tôn vinh; Đạo đức sâu dày tấm lòng lương thiện làm rạng danh nếp nhà.',
    cultureNote: 'Khuyên răn sự dung hòa giữa tài năng cá nhân với việc bồi dưỡng cái tâm thiện lành.'
  },
  {
    id: 28,
    topic: 'Đạo đức & Tu thân',
    location: 'Phòng trà, phòng tĩnh tâm tu dưỡng',
    firstClauseHan: '靜 坐 思 過 恆 自 省',
    firstClauseHV: 'Tĩnh tọa tư quá hằng tự tỉnh',
    secondClauseHan: '平 心 待 人 化 無 非',
    secondClauseHV: 'Bình tâm đãi nhân hóa vô phi',
    meaning: 'Ngồi yên nghĩ lại lỗi lầm của bản thân để luôn tự xét mình; Giữ lòng bình thản đối đãi với người sẽ hóa giải mọi thị phi sai trái.',
    cultureNote: 'Phương pháp tu dưỡng tâm tính: Thường xuyên tự soi xét khuyết điểm của bản thân thay vì phán xét người khác.'
  },
  {
    id: 29,
    topic: 'Đạo đức & Tu thân',
    location: 'Gian chính phòng khách, thư phòng',
    firstClauseHan: '百 善 孝 為 先',
    firstClauseHV: 'Bách thiện hiếu vi tiên',
    secondClauseHan: '萬 事 和 為 貴',
    secondClauseHV: 'Vạn sự hòa vi quý',
    meaning: 'Trong trăm nết điều thiện thì lòng hiếu thảo đứng đầu; Trong muôn sự ở đời thì sự hòa thuận là đáng quý nhất.',
    cultureNote: 'Hai chân lý đạo đức then chốt giúp gia đình êm ấm và xã hội an vui, thịnh vượng.'
  },
  {
    id: 30,
    topic: 'Đạo đức & Tu thân',
    location: 'Bàn làm việc, phòng học tập',
    firstClauseHan: '堅 持 忍 耐 成 大 業',
    firstClauseHV: 'Kiên trì nhẫn nại thành đại nghiệp',
    secondClauseHan: '謙 遜 學 習 得 智 慧',
    secondClauseHV: 'Khiêm tốn học hỏi đắc trí tuệ',
    meaning: 'Kiên trì nhẫn nại vượt qua gian khó sẽ làm nên nghiệp lớn; Khiêm tốn cầu thị học hỏi không ngừng sẽ đạt được trí tuệ uyên thâm.',
    cultureNote: 'Đức tính nhẫn nại và khiêm cung là chìa khóa mở cánh cửa tri thức và thành tựu chân chính.'
  }
];

/* ==========================================
   20 Chữ Nôm / Hán Tự Thông Dụng
   ========================================== */
const NOM_FLASHCARDS: NomCard[] = [
  { id: 1, char: '福', hv: 'Phúc', nom: 'Phúc / Phước', pinyin: 'FÚ', strokes: 14, radical: 'Bộ Thị (礻)', meaning: 'Điều tốt lành, may mắn, hạnh phúc do ăn ở nhân đức mà có.', context: 'Thường dán trước cửa dịp Tết, thêu trên áo dài, khắc trên mâm ngũ quả.', compounds: 'Hạnh phúc, Phúc đức, Phúc tinh.' },
  { id: 2, char: '祿', hv: 'Lộc', nom: 'Lộc', pinyin: 'LÙ', strokes: 12, radical: 'Bộ Thị (礻)', meaning: 'Bổng lộc triều đình, tài lộc dồi dào, thành quả xứng đáng của sự phấn đấu.', context: 'Tượng Tam đa Phúc - Lộc - Thọ ngày đầu năm mới.', compounds: 'Tài lộc, Lộc xuân, Phúc lộc.' },
  { id: 3, char: '壽', hv: 'Thọ', nom: 'Thọ', pinyin: 'SHÒU', strokes: 14, radical: 'Bộ Sĩ (士)', meaning: 'Sống lâu dài lâu, sức khỏe dẻo dai, trường cửu cùng con cháu.', context: 'Trang trí trong lễ mừng thọ các cụ ông cụ bà từ 70, 80, 90 tuổi.', compounds: 'Trường thọ, Thọ diên, Khang thọ.' },
  { id: 4, char: '德', hv: 'Đức', nom: 'Đức', pinyin: 'DÉ', strokes: 15, radical: 'Bộ Xích (彳)', meaning: 'Đạo đức, phẩm hạnh trong sáng, sống nhân nghĩa có trước có sau.', context: 'Câu đối: "Tiên tích đức hậu tầm long" (Trước lo tích đức, sau mới tìm đất tốt).', compounds: 'Đạo đức, Công đức, Đức hạnh.' },
  { id: 5, char: '心', hv: 'Tâm', nom: 'Tâm / Lòng', pinyin: 'XĪN', strokes: 4, radical: 'Bộ Tâm (心)', meaning: 'Trái tim, lòng dạ, suy nghĩ cốt lõi của lương tâm con người.', context: 'Bức thư pháp chữ Tâm thường treo ở gian chính nhắc nhở giữ tâm thanh tịnh.', compounds: 'Tâm đức, Thành tâm, Tâm an.' },
  { id: 6, char: '安', hv: 'An', nom: 'An / Yên', pinyin: 'ĀN', strokes: 6, radical: 'Bộ Miên (宀)', meaning: 'Yên ổn, bình an, không lo âu nguy hiểm (dưới mái nhà có phụ nữ thì yên vui).', context: 'Chúc tụng "Bình an vô sự", "Vạn sự an khang" trong thiếp chúc xuân.', compounds: 'Bình an, An lạc, An cư.' },
  { id: 7, char: '仁', hv: 'Nhân', nom: 'Nhân', pinyin: 'RÉN', strokes: 4, radical: 'Bộ Nhân (亻)', meaning: 'Lòng thương người, sự bác ái, cái gốc trong ngũ thường của Nho gia.', context: 'Nguyễn Trãi viết: "Việc nhân nghĩa cốt ở yên dân".', compounds: 'Nhân hậu, Nhân từ, Nhân nghĩa.' },
  { id: 8, char: '義', hv: 'Nghĩa', nom: 'Nghĩa / Ngãi', pinyin: 'YÌ', strokes: 13, radical: 'Bộ Dương (羊)', meaning: 'Lẽ phải, lòng trung kiên, trách nhiệm đạo lý giữa người với người.', context: 'Đi cùng với tình nghĩa, đạo nghĩa vợ chồng, bè bạn chí cốt.', compounds: 'Chính nghĩa, Ý nghĩa, Trượng nghĩa.' },
  { id: 9, char: '智', hv: 'Trí', nom: 'Trí', pinyin: 'ZHÌ', strokes: 12, radical: 'Bộ Nhật (日)', meaning: 'Sự hiểu biết sâu rộng, trí tuệ minh mẫn, phân định rõ đúng sai.', context: 'Học thức Nho học: "Trí giả bất hoặc" (Người có trí thì không bị mê hoặc).', compounds: 'Trí tuệ, Minh trí, Ý chí.' },
  { id: 10, char: '信', hv: 'Tín', nom: 'Tín / Tin', pinyin: 'XÌN', strokes: 9, radical: 'Bộ Nhân (亻)', meaning: 'Giữ lời hứa, sự tin cậy, thật thà không gian dối (Người nói ra là phải tin được).', context: 'Chữ tín trong kinh doanh buôn bán và đối nhân xử thế truyền thống.', compounds: 'Uy tín, Tín nhiệm, Trung tín.' },
  { id: 11, char: '禮', hv: 'Lễ', nom: 'Lễ / Lạy', pinyin: 'LĨ', strokes: 17, radical: 'Bộ Thị (礻)', meaning: 'Lễ nghi, phép tắc, tôn ti trật tự và sự tôn kính với tiền nhân.', context: 'Phương châm học đường ngàn đời: "Tiên học lễ, hậu học văn".', compounds: 'Lễ nghĩa, Lễ giáo, Lễ phép.' },
  { id: 12, char: '孝', hv: 'Hiếu', nom: 'Hiếu', pinyin: 'XIÀO', strokes: 7, radical: 'Bộ Tử (子)', meaning: 'Lòng hiếu thảo, phụng dưỡng và kính trọng ông bà cha mẹ.', context: 'Đạo hiếu đứng đầu trăm nết hạnh (Bách hạnh hiếu vi tiên).', compounds: 'Hiếu thảo, Hiếu thuận, Báo hiếu.' },
  { id: 13, char: '和', hv: 'Hòa', nom: 'Hòa / Hài', pinyin: 'HÉ', strokes: 8, radical: 'Bộ Khẩu (口)', meaning: 'Sự hòa thuận, êm ấm, không xung đột thù hằn.', context: 'Người xưa dặn dò: "Gia hòa vạn sự hưng" (Nhà hòa thuận muôn việc hưng thịnh).', compounds: 'Hòa hợp, Ôn hòa, Hòa thuận.' },
  { id: 14, char: '緣', hv: 'Duyên', nom: 'Duyên', pinyin: 'YUÁN', strokes: 15, radical: 'Bộ Mịch (糸)', meaning: 'Mối duyên gắn kết, sự gặp gỡ định mệnh do nhân quả tạo nên.', context: 'Văn hóa dân gian thường bàn về "duyên nợ", "hữu duyên thiên lý năng tương ngộ".', compounds: 'Duyên phận, Cơ duyên, Tùy duyên.' },
  { id: 15, char: '才', hv: 'Tài', nom: 'Tài', pinyin: 'CÁI', strokes: 3, radical: 'Bộ Thủ (扌)', meaning: 'Tài năng, khả năng xuất chúng hơn người trong học thuật, mưu lược.', context: 'Nguyễn Du: "Chữ tâm kia mới bằng ba chữ tài".', compounds: 'Tài hoa, Nhân tài, Thiên tài.' },
  { id: 16, char: '忍', hv: 'Nhẫn', nom: 'Nhẫn', pinyin: 'RĚN', strokes: 7, radical: 'Bộ Tâm (心)', meaning: 'Nhẫn nại, kiềm chế cảm xúc bốc đồng, chịu đựng để làm nên việc lớn.', context: 'Bức thư pháp hình mũi dao trên chữ tâm: Kiềm tỏa cơn nóng giận.', compounds: 'Nhẫn nại, Kiên nhẫn, Nhẫn nhịn.' },
  { id: 17, char: '勇', hv: 'Dũng', nom: 'Dũng / Dõng', pinyin: 'YǑNG', strokes: 9, radical: 'Bộ Lực (力)', meaning: 'Lòng can đảm, dũng cảm đối diện hiểm nguy vì lý tưởng cao đẹp.', context: 'Một trong tam đức của Nho học: Nhân - Trí - Dũng.', compounds: 'Dũng khí, Dũng cảm, Anh dũng.' },
  { id: 18, char: '道', hv: 'Đạo', nom: 'Đạo / Đạo giáo', pinyin: 'DÀO', strokes: 12, radical: 'Bộ Sước (辶)', meaning: 'Con đường, đạo lý tự nhiên, chân lý tối cao của vũ trụ và nhân sinh.', context: 'Đạo làm người, đạo hiếu, đạo nghĩa quân tử ngàn năm.', compounds: 'Đạo lý, Đạo đức, Chân đạo.' },
  { id: 19, char: '慧', hv: 'Tuệ', nom: 'Tuệ / Huệ', pinyin: 'HUÌ', strokes: 15, radical: 'Bộ Tâm (心)', meaning: 'Trí tuệ thanh tịnh thấu suốt sự thật của Phật giáo.', context: 'Tu hành thiền định: "Giới - Định - Tuệ" để thoát khỏi bể khổ luân hồi.', compounds: 'Trí tuệ, Tuệ nhãn, Quang tuệ.' },
  { id: 20, char: '靜', hv: 'Tĩnh', nom: 'Tĩnh / Lặng', pinyin: 'JÌNG', strokes: 14, radical: 'Bộ Thanh (青)', meaning: 'Sự yên lặng, tĩnh lặng trong tâm hồn, không bị dao động bởi ngoại cảnh.', context: 'Gia Cát Lượng khuyên con: "Đạm bạc dĩ minh chí, ninh tĩnh dĩ trí viễn".', compounds: 'Thanh tĩnh, Tĩnh tâm, Bình tĩnh.' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'screen-couplets' | 'screen-flashcard' | 'screen-gemini' | 'screen-about' | 'screen-sources'>('screen-couplets');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Screen 1: Couplets state
  const [coupletSearch, setCoupletSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [currentCoupletIndex, setCurrentCoupletIndex] = useState(0);

  // Screen 2: Flashcards state
  const [cardSearch, setCardSearch] = useState('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Screen 3: AI Chat state
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'ai',
      text: 'Kính chào quý bạn hữu yêu mến văn hóa Hán Nôm! Ta là trợ lý cổ văn. Quý bạn cần dịch nghĩa, chiết tự hay tra cứu câu đối, hoành phi trên đình chùa, nhà thờ họ xin hãy gửi vào đây.'
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Filtered Couplets
  const filteredCouplets = COUPLETS_DATABASE.filter(item => {
    const matchTopic = selectedTopic === 'all' || item.topic === selectedTopic;
    const q = coupletSearch.trim().toLowerCase();
    const matchKeyword = !q ||
      item.firstClauseHan.includes(q) ||
      item.firstClauseHV.toLowerCase().includes(q) ||
      item.secondClauseHan.includes(q) ||
      item.secondClauseHV.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q);
    return matchTopic && matchKeyword;
  });

  const activeCouplet = filteredCouplets[currentCoupletIndex] || null;

  // Flashcards search
  const handleFlashcardSearch = (q: string) => {
    setCardSearch(q);
    const query = q.trim().toLowerCase();
    if (!query) return;
    const idx = NOM_FLASHCARDS.findIndex(item =>
      item.hv.toLowerCase().includes(query) ||
      item.nom.toLowerCase().includes(query) ||
      item.char.includes(query) ||
      item.meaning.toLowerCase().includes(query)
    );
    if (idx !== -1) {
      setCurrentFlashcardIndex(idx);
      setIsFlashcardFlipped(false);
    }
  };

  const currentCard = NOM_FLASHCARDS[currentFlashcardIndex];

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiLoading]);

  const handleTabSwitch = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevCouplet = () => {
    if (currentCoupletIndex > 0) {
      setCurrentCoupletIndex(currentCoupletIndex - 1);
    }
  };

  const handleNextCouplet = () => {
    if (currentCoupletIndex < filteredCouplets.length - 1) {
      setCurrentCoupletIndex(currentCoupletIndex + 1);
    }
  };

  const handlePrevFlashcard = () => {
    setIsFlashcardFlipped(false);
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    } else {
      setCurrentFlashcardIndex(NOM_FLASHCARDS.length - 1);
    }
  };

  const handleNextFlashcard = () => {
    setIsFlashcardFlipped(false);
    if (currentFlashcardIndex < NOM_FLASHCARDS.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      setCurrentFlashcardIndex(0);
    }
  };

  const handleSelectQuickChar = (idx: number) => {
    setCurrentFlashcardIndex(idx);
    setIsFlashcardFlipped(false);
  };

  const sendToGemini = async (customPrompt?: string) => {
    const text = (customPrompt ?? aiInput).trim();
    if (!text || isAiLoading) return;

    const historyPayload = chatMessages
      .filter(msg => msg.id !== 'init')
      .slice(-8)
      .map(msg => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        text: msg.text
      }));

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setAiInput('');
    setIsAiLoading(true);

    let reply = '';

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: historyPayload
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Lỗi máy chủ (${res.status})`);
      }

      reply = data?.reply || 'Không nhận được phản hồi từ hệ thống AI.';
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      reply = `⚠️ ${errMsg}`;
    }

    setIsAiLoading(false);
    setChatMessages(prev => [
      ...prev,
      {
        id: 'ai-' + Date.now(),
        role: 'ai',
        text: reply
      }
    ]);
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatResponse = (str: string) => {
    return escapeHtml(str)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•/g, '<span class="text-trienRed font-bold">•</span>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-trienRed selection:text-white">
      {/* ==================== 1. THANH ĐIỀU HƯỚNG RESPONSIVE ==================== */}
      <header className="sticky top-0 z-50 bg-[#3a2216]/95 text-parchment backdrop-blur border-b-2 border-goldSilk shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleTabSwitch('screen-couplets')}
          >
            <div className="w-10 h-10 bg-trienRed rounded flex items-center justify-center border border-amber-300 shadow">
              <span className="font-han text-2xl text-amber-100 font-bold">漢</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-wide text-amber-200 uppercase font-serif">Sổ Tay Hán Nôm</h1>
              <p className="text-[11px] text-amber-400/80 tracking-wider">Từ Điển Câu Đối & Chữ Nôm Cổ</p>
            </div>
          </div>

          {/* Nút Hamburger Menu (Mobile < 768px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-amber-200 hover:text-white hover:bg-stone-800 focus:outline-none transition cursor-pointer"
            aria-label="Mở Menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>

          {/* Menu Tabs trên Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <button
              onClick={() => handleTabSwitch('screen-couplets')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'screen-couplets'
                  ? 'bg-trienRed text-white shadow'
                  : 'hover:bg-woodBrown text-amber-200'
              }`}
            >
              <i className="fa-solid fa-book-open"></i> <span>1. Từ điển Câu đối</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-flashcard')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'screen-flashcard'
                  ? 'bg-trienRed text-white shadow'
                  : 'hover:bg-woodBrown text-amber-200'
              }`}
            >
              <i className="fa-solid fa-layer-group"></i> <span>2. Flashcard 3D</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-gemini')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'screen-gemini'
                  ? 'bg-trienRed text-white shadow'
                  : 'hover:bg-woodBrown text-amber-200'
              }`}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-amber-400"></i> <span>3. Hỏi đáp AI</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-about')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'screen-about'
                  ? 'bg-trienRed text-white shadow'
                  : 'hover:bg-woodBrown text-amber-200'
              }`}
            >
              <i className="fa-solid fa-circle-info"></i> <span>4. Giới thiệu</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-sources')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'screen-sources'
                  ? 'bg-trienRed text-white shadow'
                  : 'hover:bg-woodBrown text-amber-200'
              }`}
            >
              <i className="fa-solid fa-landmark"></i> <span>5. Nguồn tham khảo</span>
            </button>
          </nav>
        </div>

        {/* Menu Thả Xuống Trên Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-3 border-t border-amber-900/40 bg-[#341d13] flex flex-col gap-2 text-sm">
            <button
              onClick={() => handleTabSwitch('screen-couplets')}
              className={`text-left px-3 py-2 rounded flex items-center gap-2 font-medium cursor-pointer ${
                activeTab === 'screen-couplets' ? 'bg-trienRed text-white' : 'text-amber-200 hover:bg-woodBrown'
              }`}
            >
              <i className="fa-solid fa-book-open w-5"></i> <span>1. Từ điển Câu đối</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-flashcard')}
              className={`text-left px-3 py-2 rounded flex items-center gap-2 font-medium cursor-pointer ${
                activeTab === 'screen-flashcard' ? 'bg-trienRed text-white' : 'text-amber-200 hover:bg-woodBrown'
              }`}
            >
              <i className="fa-solid fa-layer-group w-5"></i> <span>2. Flashcard 3D</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-gemini')}
              className={`text-left px-3 py-2 rounded flex items-center gap-2 font-medium cursor-pointer ${
                activeTab === 'screen-gemini' ? 'bg-trienRed text-white' : 'text-amber-200 hover:bg-woodBrown'
              }`}
            >
              <i className="fa-solid fa-wand-magic-sparkles w-5 text-amber-400"></i> <span>3. Hỏi đáp AI</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-about')}
              className={`text-left px-3 py-2 rounded flex items-center gap-2 font-medium cursor-pointer ${
                activeTab === 'screen-about' ? 'bg-trienRed text-white' : 'text-amber-200 hover:bg-woodBrown'
              }`}
            >
              <i className="fa-solid fa-circle-info w-5"></i> <span>4. Giới thiệu</span>
            </button>
            <button
              onClick={() => handleTabSwitch('screen-sources')}
              className={`text-left px-3 py-2 rounded flex items-center gap-2 font-medium cursor-pointer ${
                activeTab === 'screen-sources' ? 'bg-trienRed text-white' : 'text-amber-200 hover:bg-woodBrown'
              }`}
            >
              <i className="fa-solid fa-landmark w-5"></i> <span>5. Nguồn tham khảo</span>
            </button>
          </div>
        )}
      </header>

      {/* ==================== KHU VỰC NỘI DUNG CHÍNH (5 MÀN HÌNH) ==================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">

        {/* ========== MÀN HÌNH 1: TỪ ĐIỂN CÂU ĐỐI CỔ (30 CÂU ĐỐI) ========== */}
        {activeTab === 'screen-couplets' && (
          <section className="space-y-4">
            <div className="bg-parchment/95 p-4 rounded-xl border border-amber-900/30 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-stone-500 text-sm"></i>
                <input
                  type="text"
                  value={coupletSearch}
                  onChange={e => {
                    setCoupletSearch(e.target.value);
                    setCurrentCoupletIndex(0);
                  }}
                  placeholder="Tìm chữ Hán, Hán Việt, dịch nghĩa..."
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfbf6] border border-amber-900/30 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-trienRed"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs sm:text-sm">
                <button
                  onClick={() => { setSelectedTopic('all'); setCurrentCoupletIndex(0); }}
                  className={`px-3 py-1.5 rounded-full border border-amber-800 cursor-pointer ${
                    selectedTopic === 'all'
                      ? 'font-bold bg-amber-200/80 text-stone-900'
                      : 'border-amber-800/40 text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  Tất cả (30)
                </button>
                <button
                  onClick={() => { setSelectedTopic('Thờ cúng Tổ tiên'); setCurrentCoupletIndex(0); }}
                  className={`px-3 py-1.5 rounded-full border border-amber-800/40 cursor-pointer ${
                    selectedTopic === 'Thờ cúng Tổ tiên'
                      ? 'font-bold bg-amber-200/80 text-stone-900'
                      : 'text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  Tổ Tiên (8)
                </button>
                <button
                  onClick={() => { setSelectedTopic('Đình Chùa & Di tích'); setCurrentCoupletIndex(0); }}
                  className={`px-3 py-1.5 rounded-full border border-amber-800/40 cursor-pointer ${
                    selectedTopic === 'Đình Chùa & Di tích'
                      ? 'font-bold bg-amber-200/80 text-stone-900'
                      : 'text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  Đình Chùa (8)
                </button>
                <button
                  onClick={() => { setSelectedTopic('Mừng Xuân & Chúc Tết'); setCurrentCoupletIndex(0); }}
                  className={`px-3 py-1.5 rounded-full border border-amber-800/40 cursor-pointer ${
                    selectedTopic === 'Mừng Xuân & Chúc Tết'
                      ? 'font-bold bg-amber-200/80 text-stone-900'
                      : 'text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  Mừng Xuân (7)
                </button>
                <button
                  onClick={() => { setSelectedTopic('Đạo đức & Tu thân'); setCurrentCoupletIndex(0); }}
                  className={`px-3 py-1.5 rounded-full border border-amber-800/40 cursor-pointer ${
                    selectedTopic === 'Đạo đức & Tu thân'
                      ? 'font-bold bg-amber-200/80 text-stone-900'
                      : 'text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  Tu Thân (7)
                </button>
              </div>
            </div>

            {/* Khung Quyển Sách Giấy Dó 3D */}
            <div className="relative w-full bg-[#fbf7eb] book-border book-shadow rounded-lg p-5 sm:p-8 min-h-[480px] flex flex-col justify-between overflow-hidden">
              <div className="absolute top-2 left-2 text-stone-400 text-xs font-serif select-none">❖ ──────</div>
              <div className="absolute top-2 right-2 text-stone-400 text-xs font-serif select-none">────── ❖</div>
              <div className="absolute bottom-2 left-2 text-stone-400 text-xs font-serif select-none">❖ ──────</div>
              <div className="absolute bottom-2 right-2 text-stone-400 text-xs font-serif select-none">────── ❖</div>

              <div className="absolute top-4 right-5 trien-seal px-2 py-1 text-xs">
                <span>漢喃珍本<br />BẢO DI</span>
              </div>

              <div className="my-auto pt-4 pb-3">
                {activeCouplet ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/20 pb-2">
                      <span className="text-xs bg-amber-900/10 text-woodBrown px-3 py-1 rounded-full font-bold border border-amber-900/20">
                        <i className="fa-solid fa-tag mr-1 text-trienRed"></i> {activeCouplet.topic}
                      </span>
                      <span className="text-xs text-stone-700 italic font-medium">
                        <i className="fa-solid fa-location-dot mr-1 text-trienRed"></i> Vị trí: {activeCouplet.location}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#fcf9f1] p-4 sm:p-6 rounded-lg border border-amber-900/15 shadow-inner">
                      <div className="text-center space-y-3 border-b md:border-b-0 md:border-r border-amber-900/20 pb-4 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-trienRed uppercase tracking-wider block">Vế Xuất (Vế 1)</span>
                        <p className="font-han text-3xl sm:text-4xl text-stone-900 tracking-widest font-bold leading-relaxed">{activeCouplet.firstClauseHan}</p>
                        <p className="text-base sm:text-lg font-serif font-bold text-woodBrown">{activeCouplet.firstClauseHV}</p>
                      </div>
                      <div className="text-center space-y-3 pt-2 md:pt-0 md:pl-2">
                        <span className="text-[11px] font-bold text-trienRed uppercase tracking-wider block">Vế Đối (Vế 2)</span>
                        <p className="font-han text-3xl sm:text-4xl text-stone-900 tracking-widest font-bold leading-relaxed">{activeCouplet.secondClauseHan}</p>
                        <p className="text-base sm:text-lg font-serif font-bold text-woodBrown">{activeCouplet.secondClauseHV}</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-stone-900">
                      <div className="p-3 bg-amber-50/90 rounded border-l-4 border-amber-800 leading-relaxed">
                        <strong className="text-woodBrown">Dịch nghĩa tiếng Việt:</strong>
                        <p className="mt-0.5 font-medium italic text-stone-800">{activeCouplet.meaning}</p>
                      </div>
                      <div className="p-3 bg-white/80 rounded border border-amber-900/10 leading-relaxed">
                        <strong className="text-woodBrown"><i className="fa-solid fa-landmark-dome mr-1 text-goldSilk"></i> Ý nghĩa văn hóa & tâm linh:</strong>
                        <p className="mt-1 text-stone-700">{activeCouplet.cultureNote}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-stone-600">
                    <i className="fa-solid fa-scroll text-5xl mb-3 text-stone-400"></i>
                    <p className="font-serif text-base">Không tìm thấy câu đối phù hợp trong dữ liệu.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-amber-900/20 flex items-center justify-between text-xs sm:text-sm text-stone-700 font-medium">
                <button
                  onClick={handlePrevCouplet}
                  disabled={currentCoupletIndex === 0 || filteredCouplets.length === 0}
                  className="px-3 py-1.5 rounded bg-amber-900/10 hover:bg-amber-900/20 disabled:opacity-40 disabled:cursor-not-allowed text-stone-900 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-left"></i> <span>Trang trước</span>
                </button>
                <span className="font-serif italic text-amber-950 font-bold">
                  {filteredCouplets.length > 0 ? `Trang ${currentCoupletIndex + 1} / ${filteredCouplets.length}` : '0 / 0'}
                </span>
                <button
                  onClick={handleNextCouplet}
                  disabled={currentCoupletIndex >= filteredCouplets.length - 1 || filteredCouplets.length === 0}
                  className="px-3 py-1.5 rounded bg-amber-900/10 hover:bg-amber-900/20 disabled:opacity-40 disabled:cursor-not-allowed text-stone-900 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Trang sau</span> <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========== MÀN HÌNH 2: FLASHCARD 3D CHỮ NÔM ========== */}
        {activeTab === 'screen-flashcard' && (
          <section className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl font-bold font-serif text-woodBrown">Kho Thẻ Ghi Nhớ Chữ Nôm 3D</h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">Chạm để lật xoay 180° xem bộ thủ, số nét, âm đọc và điển tích văn hóa</p>
            </div>

            {/* Ô tìm kiếm flashcard */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                value={cardSearch}
                onChange={e => handleFlashcardSearch(e.target.value)}
                placeholder="Tra theo âm đọc (Phúc, Lộc, Tâm, Nhân...) hoặc nghĩa..."
                className="w-full pl-10 pr-4 py-2.5 bg-parchment border border-amber-900/40 rounded-full text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-trienRed"
              />
              <i className="fa-solid fa-search absolute left-4 top-3.5 text-stone-500"></i>
            </div>

            {/* Khối Flashcard 3D Cố Định Chiều Cao */}
            <div className="w-full max-w-md mx-auto perspective-container my-2">
              <div
                onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                className={`transform-style-3d w-full h-[380px] sm:h-[400px] rounded-2xl cursor-pointer duration-500 shadow-xl bg-parchment select-none ${
                  isFlashcardFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Mặt Trước */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl book-border bg-[#fdfbf6] p-6 flex flex-col justify-between items-center text-center">
                  <div className="w-full flex justify-between items-center text-xs text-stone-500">
                    <span className="trien-seal px-1.5 py-0.5 text-[10px]">TỰ MẪU</span>
                    <span className="italic"><i className="fa-solid fa-hand-pointer mr-1"></i>Chạm để lật mặt sau</span>
                  </div>

                  <div className="my-auto py-2">
                    <span className="font-han text-8xl sm:text-9xl text-stone-900 tracking-wider font-bold block mb-1">
                      {currentCard.char}
                    </span>
                    <p className="text-xs uppercase tracking-widest text-stone-500 font-mono font-semibold">
                      {currentCard.pinyin} • {currentCard.strokes} NÉT
                    </p>
                  </div>

                  <div className="text-xs bg-amber-100/80 border border-amber-400/50 px-3 py-1 rounded-full text-amber-950 font-medium">
                    Chữ Hán - Nôm thông dụng
                  </div>
                </div>

                {/* Mặt Sau */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl book-border bg-[#faf4e6] p-5 sm:p-6 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start border-b border-amber-900/20 pb-2">
                    <div>
                      <span className="text-2xl font-bold font-serif text-trienRed">{currentCard.hv}</span>
                      <span className="ml-2 text-xs text-stone-700 bg-amber-200/80 px-2 py-0.5 rounded font-medium">
                        Âm Nôm: {currentCard.nom}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-stone-200 px-2 py-1 rounded text-stone-800 font-semibold">
                      {currentCard.radical}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-stone-800 my-auto leading-relaxed">
                    <p><strong className="text-woodBrown">Giải nghĩa:</strong> <span>{currentCard.meaning}</span></p>
                    <p><strong className="text-woodBrown">Ngữ cảnh văn hóa:</strong> <span>{currentCard.context}</span></p>
                    <p><strong className="text-woodBrown">Cụm từ ghép:</strong> <span className="italic text-stone-600">{currentCard.compounds}</span></p>
                  </div>

                  <div className="text-center text-[11px] text-stone-500 italic border-t border-amber-900/10 pt-2">
                    Chạm thẻ để quay lại mặt trước
                  </div>
                </div>
              </div>
            </div>

            {/* Điều khiển chuyển thẻ trước/sau */}
            <div className="flex justify-center items-center gap-4 text-sm font-medium pt-2 pb-2">
              <button
                onClick={handlePrevFlashcard}
                className="px-4 py-2 rounded-lg bg-woodBrown text-amber-100 hover:bg-stone-800 transition shadow cursor-pointer"
              >
                <i className="fa-solid fa-arrow-left mr-1"></i> Chữ trước
              </button>
              <span className="text-stone-800 font-serif font-bold text-base">
                {currentFlashcardIndex + 1} / {NOM_FLASHCARDS.length}
              </span>
              <button
                onClick={handleNextFlashcard}
                className="px-4 py-2 rounded-lg bg-woodBrown text-amber-100 hover:bg-stone-800 transition shadow cursor-pointer"
              >
                Chữ sau <i className="fa-solid fa-arrow-right ml-1"></i>
              </button>
            </div>

            {/* Bảng chọn nhanh 20 chữ mẫu */}
            <div className="mt-4 border-t border-amber-900/20 pt-4">
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3 text-center">
                Bảng chọn nhanh 20 chữ mẫu (Chạm vào chữ để tra cứu)
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-xl mx-auto justify-items-center">
                {NOM_FLASHCARDS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectQuickChar(idx)}
                    className={`w-11 h-11 rounded border border-amber-900/30 transition font-han text-xl font-bold flex items-center justify-center shadow-sm cursor-pointer ${
                      idx === currentFlashcardIndex
                        ? 'bg-trienRed text-white border-trienRed'
                        : 'bg-parchment hover:bg-trienRed hover:text-white'
                    }`}
                  >
                    {item.char}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== MÀN HÌNH 3: HỎI ĐÁP & GIẢI MÃ AI ========== */}
        {activeTab === 'screen-gemini' && (
          <section className="space-y-4">
            <div className="bg-parchment/95 p-4 sm:p-6 rounded-xl border border-amber-900/30 shadow-md">
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-trienRed text-white flex items-center justify-center font-han text-xl font-bold shadow">
                    儒
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-woodBrown">Chuyên Gia Hán Nôm AI (Gemini)</h2>
                    <p className="text-xs text-stone-600">Dịch nghĩa, chiết tự, giải mã hoành phi câu đối và ngữ cảnh tâm linh</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-stone-700 mb-2">
                  <i className="fa-solid fa-bolt text-amber-600 mr-1"></i> Gợi ý câu đối kinh điển (Bấm gửi ngay cho AI giải mã):
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => sendToGemini('Giải mã câu đối: Tổ tông công đức thiên niên thịnh, Tử hiếu tôn hiền vạn đại vinh')}
                    className="bg-[#f2e7ce] hover:bg-amber-200/80 text-stone-800 px-3 py-1.5 rounded-md border border-amber-900/20 transition text-left cursor-pointer"
                  >
                    📜 Tổ tông công đức thiên niên thịnh...
                  </button>
                  <button
                    onClick={() => sendToGemini('Ý nghĩa câu đối Phật giáo: Phật pháp từ bi phổ độ mê đồ đăng giác ngạn')}
                    className="bg-[#f2e7ce] hover:bg-amber-200/80 text-stone-800 px-3 py-1.5 rounded-md border border-amber-900/20 transition text-left cursor-pointer"
                  >
                    🪷 Phật pháp từ bi phổ độ mê đồ đăng giác ngạn
                  </button>
                  <button
                    onClick={() => sendToGemini('Giải mã câu đối Tết: Thiên tăng tuế nguyệt nhân tăng thọ, Xuân mãn càn khôn phúc mãn đường')}
                    className="bg-[#f2e7ce] hover:bg-amber-200/80 text-stone-800 px-3 py-1.5 rounded-md border border-amber-900/20 transition text-left cursor-pointer"
                  >
                    🌸 Thiên tăng tuế nguyệt nhân tăng thọ...
                  </button>
                  <button
                    onClick={() => sendToGemini('Chiết tự chữ Nho và triết lý: Bách thiện hiếu vi tiên, Vạn sự hòa vi quý')}
                    className="bg-[#f2e7ce] hover:bg-amber-200/80 text-stone-800 px-3 py-1.5 rounded-md border border-amber-900/20 transition text-left cursor-pointer"
                  >
                    ✍️ Bách thiện hiếu vi tiên / Vạn sự hòa vi quý
                  </button>
                </div>
              </div>

              {/* Box chat */}
              <div className="h-80 overflow-y-auto p-4 bg-[#fdfbf6] rounded-lg border border-amber-900/20 space-y-3 mb-4 text-sm leading-relaxed">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-trienRed text-white text-xs flex items-center justify-center shrink-0">
                        儒
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-lg max-w-[85%] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-woodBrown text-amber-50 border border-amber-900/20'
                          : 'bg-[#f3ead7] text-stone-900 border border-amber-900/10'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                    />
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-stone-700 text-white text-xs flex items-center justify-center shrink-0">
                        Bạn
                      </div>
                    )}
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-trienRed text-white text-xs flex items-center justify-center shrink-0">
                      儒
                    </div>
                    <div className="bg-[#f3ead7] p-3 rounded-lg text-stone-700 text-xs italic border border-amber-900/10">
                      <i className="fa-solid fa-spinner fa-spin mr-1 text-trienRed"></i> Đang tra cứu thư tịch & giải mã Hán Nôm...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') sendToGemini();
                  }}
                  placeholder="Nhập chữ Hán, câu đối hoặc nội dung cần tra cứu..."
                  className="flex-1 px-4 py-2.5 bg-white border border-amber-900/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-trienRed"
                />
                <button
                  onClick={() => sendToGemini()}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="bg-trienRed hover:bg-trienRedDark disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow cursor-pointer"
                >
                  <span>Giải Mã</span> <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========== MÀN HÌNH 4: TRANG GIỚI THIỆU ========== */}
        {activeTab === 'screen-about' && (
          <section className="space-y-6">
            <div className="bg-[#fbf7eb] book-border book-shadow p-6 sm:p-10 rounded-xl relative max-w-3xl mx-auto">
              <div className="absolute top-6 right-6 trien-seal p-2 text-center text-xs">
                <span>THỰC TẬP<br />ĐỢT 15</span>
              </div>

              <div className="text-center border-b border-amber-900/20 pb-5 mb-6">
                <span className="text-xs uppercase tracking-widest text-trienRed font-bold">Dự án số hóa di sản Hán Nôm Việt Nam</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-woodBrown mt-1">Sổ Tay Hán Nôm & Từ Điển Câu Đối Cổ</h2>
                <p className="text-xs text-stone-500 mt-1 italic">Ứng dụng phục vụ học tập, tra cứu cộng đồng phi lợi nhuận</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-800 mb-6 bg-white/70 p-4 rounded-lg border border-amber-900/20">
                <div>
                  <p className="text-stone-500 text-xs">Sản phẩm thực tập của:</p>
                  <p className="font-bold text-base text-trienRed">Nguyễn Văn Hoàng</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs">Mã sinh viên & Phân nhóm:</p>
                  <p className="font-semibold">Mã SV: <span className="font-mono font-bold text-woodBrown">PH64335</span> | Nhóm: <span className="font-bold">Nhóm 2</span></p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs">Đề tài đề án:</p>
                  <p className="font-semibold text-stone-900">B03 - Nhập môn chữ Nôm và Hán Nôm</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs">Chương trình liên kết đào tạo:</p>
                  <p className="font-semibold text-stone-900">Thực tập sinh Đợt 15 (IMTA TECH x FPT Polytechnic)</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p>
                  <i className="fa-solid fa-quote-left text-trienRed/50 mr-1 text-base"></i>
                  Chữ Hán Nôm là linh hồn ngàn năm của văn hóa dân tộc Việt Nam. Dự án được xây dựng với mục tiêu giúp sinh viên, học sinh, người dân và du khách dễ dàng tra cứu, học tập và giải mã ý nghĩa các câu đối, hoành phi trên di tích, đình chùa, nhà thờ họ và ngày Tết cổ truyền.
                </p>
                <div className="p-3 bg-red-50 border-l-4 border-trienRed text-trienRedDark font-medium rounded-r-md">
                  ⭐ <strong>Tuyên bố tôn chỉ:</strong> "Sản phẩm phi lợi nhuận phụng sự cộng đồng, không quảng cáo, không thu phí."
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========== MÀN HÌNH 5: NGUỒN THAM KHẢO ========== */}
        {activeTab === 'screen-sources' && (
          <section className="space-y-5">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl font-bold font-serif text-woodBrown">Nguồn Tư Liệu Học Thuật Tham Khảo</h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">Dữ liệu được khảo sát và đối soát từ 5 nguồn học thuật chính thống uy tín</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-sm">
              <div className="bg-parchment p-4 rounded-xl border border-amber-900/30 shadow-sm hover:border-trienRed transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-trienRed/10 text-trienRed px-2 py-0.5 rounded font-semibold font-mono">NGUỒN 01</span>
                    <i className="fa-solid fa-graduation-cap text-stone-400"></i>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">Viện Nghiên cứu Hán Nôm</h3>
                  <p className="text-xs text-stone-600 mt-1">Cơ quan hàng đầu thuộc Viện Hàn lâm Khoa học xã hội Việt Nam lưu trữ văn bia, thư tịch cổ và từ điển di sản quốc gia.</p>
                </div>
                <a
                  href="http://www.hannom.org.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-trienRed font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>hannom.org.vn</span> <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>

              <div className="bg-parchment p-4 rounded-xl border border-amber-900/30 shadow-sm hover:border-trienRed transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-trienRed/10 text-trienRed px-2 py-0.5 rounded font-semibold font-mono">NGUỒN 02</span>
                    <i className="fa-solid fa-globe text-stone-400"></i>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">Hội Bảo tồn Di sản Chữ Nôm</h3>
                  <p className="text-xs text-stone-600 mt-1">Tổ chức quốc tế chuyên số hóa, chuẩn hóa Unicode chữ Nôm, lưu trữ kho tàng văn tự Nôm đồ sộ từ nguyên tác cổ bản.</p>
                </div>
                <a
                  href="http://www.nomfoundation.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-trienRed font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>nomfoundation.org</span> <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>

              <div className="bg-parchment p-4 rounded-xl border border-amber-900/30 shadow-sm hover:border-trienRed transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-trienRed/10 text-trienRed px-2 py-0.5 rounded font-semibold font-mono">NGUỒN 03</span>
                    <i className="fa-solid fa-book text-stone-400"></i>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">Từ Điển Hán Nôm Trích Dẫn</h3>
                  <p className="text-xs text-stone-600 mt-1">Hệ thống từ điển điện tử đối chiếu câu trích dẫn từ Truyện Kiều, Chinh phụ ngâm và thi ca trung đại Việt Nam.</p>
                </div>
                <span className="mt-3 text-xs text-stone-500 italic">Thư tịch tra cứu trích dẫn trực tuyến</span>
              </div>

              <div className="bg-parchment p-4 rounded-xl border border-amber-900/30 shadow-sm hover:border-trienRed transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-trienRed/10 text-trienRed px-2 py-0.5 rounded font-semibold font-mono">NGUỒN 04</span>
                    <i className="fa-solid fa-archway text-stone-400"></i>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">Cổng TT Di Sản Văn Hóa Việt Nam</h3>
                  <p className="text-xs text-stone-600 mt-1">Cơ sở dữ liệu của Cục Di sản Văn hóa về các di tích quốc gia, bi ký, hệ thống câu đối đại tự tại các lăng tẩm đình đền.</p>
                </div>
                <span className="mt-3 text-xs text-stone-500 italic">Cục Di sản Văn hóa - Bộ VHTTDL</span>
              </div>

              <div className="bg-parchment p-4 rounded-xl border border-amber-900/30 shadow-sm hover:border-trienRed transition md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-goldSilk/20 text-woodBrown px-2 py-0.5 rounded font-semibold font-mono">NGUỒN 05</span>
                    <i className="fa-solid fa-school text-stone-400"></i>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">Giáo trình Hán Nôm - FPT Polytechnic</h3>
                  <p className="text-xs text-stone-600 mt-1">Tài liệu chuyên đề "Nhập môn chữ Nôm và Hán Nôm", phương pháp phân tích 214 bộ thủ, quy tắc Lục thư và giải nghĩa câu đối thực tế.</p>
                </div>
                <span className="mt-3 text-xs text-amber-900 font-semibold">Tài liệu lưu hành đào tạo nội bộ</span>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ==================== CHÂN TRANG ==================== */}
      <footer className="mt-auto bg-[#2b170e] text-amber-200/80 py-4 border-t border-amber-900/40 text-xs text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-serif">
            © 2026 Sổ Tay Hán Nôm & Từ Điển Câu Đối Cổ • Sinh viên: <span className="text-amber-100 font-semibold">Nguyễn Văn Hoàng (PH64335)</span>
          </p>
          <p className="text-[11px] text-amber-400/60">
            Đề tài B03 - Nhập môn chữ Nôm & Hán Nôm • Thực tập sinh Đợt 15 IMTA TECH x FPT Polytechnic
          </p>
        </div>
      </footer>
    </div>
  );
}
