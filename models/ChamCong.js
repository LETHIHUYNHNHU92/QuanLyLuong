const mongoose = require('mongoose');

const chamCongSchema = new mongoose.Schema({
    MaCanBo: { type: String, required: true }, 
    Thang: { type: Number, required: true },   
    Nam: { type: Number, required: true },   
	
    SoNgayLamViec: { type: Number, default: 0 }, 
	SoNgayNghiCoPhep: { type: Number, default: 0 },   
    SoNgayNghiKhongPhep: { type: Number, default: 0 }, 
	
    SoGioTangCa: { type: Number, default: 0 },   
    TienThuong: { type: Number, default: 0 }, 
    TienPhat: { type: Number, default: 0 },   
    TienTamUng: { type: Number, default: 0 }, 
    GhiChu: { type: String }
});

module.exports = mongoose.model('ChamCong', chamCongSchema);