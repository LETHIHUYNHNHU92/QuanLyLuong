const mongoose = require('mongoose');

const NhanVienSchema = new mongoose.Schema({
    MaCanBo: { type: String, required: true, unique: true }, 
    HoVaTen: { type: String, required: true },
    Email: { type: String, required: true }, 
    NgaySinh: { type: String },
    GioiTinh: { type: String },
    SoDienThoai: { type: String },
	
    PhongBan: { type: String }, 
    ChucVu: { type: String },   
    TrinhDoHocVan: { type: String },
    NguoiPhuThuoc: { type: Number, default: 0 }, 
	
	MatKhau: { type: String, default: '123456' }, 
    VaiTro: { type: String, default: 'Nhân viên' },
    
    DanhSachPhuCap: [{
        TenPhuCap: String,
        SoTien: Number
    }]
});


const nhanVienModel = mongoose.models.NhanVien || mongoose.model('NhanVien', NhanVienSchema);
module.exports = nhanVienModel;