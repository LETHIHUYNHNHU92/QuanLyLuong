const mongoose = require('mongoose');

const hopDongSchema = new mongoose.Schema({
    MaHD: { type: String, required: true, unique: true }, 
    MaCanBo: { type: String, required: true }, 
    LoaiHopDong: { type: String, required: true }, 
    NgayKy: { type: String },
    NgayHetHan: { type: String },
    LuongCoBan: { type: Number, default: 0 },
	PhuCapAnUong: { type: Number, default: 0 },
    PhuCapDiLai: { type: Number, default: 0 },
    GhiChu: { type: String }
});

module.line = mongoose.model('HopDong', hopDongSchema);
module.exports = mongoose.model('HopDong', hopDongSchema);