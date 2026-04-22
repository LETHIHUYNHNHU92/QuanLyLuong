const mongoose = require('mongoose');

const bangLuongSchema = new mongoose.Schema({
    MaCanBo: { type: String, required: true },
    Thang: { type: Number, required: true },
    Nam: { type: Number, required: true },
    
    LuongCoBan: { type: Number, default: 0 },
    SoNgayLam: { type: Number, default: 0 },
    TongPhuCap: { type: Number, default: 0 },
    Thuong: { type: Number, default: 0 },
    Phat: { type: Number, default: 0 },
    TamUng: { type: Number, default: 0 },
    BaoHiem: { type: Number, default: 0 },
    GiamTruGiaCanh: { type: Number, default: 0 },
    ThueTNCN: { type: Number, default: 0 },
    
    ThucLanh: { type: Number, default: 0 },
    TrangThai: { type: String, default: "Đã chốt" }
});

module.exports = mongoose.model('BangLuong', bangLuongSchema);