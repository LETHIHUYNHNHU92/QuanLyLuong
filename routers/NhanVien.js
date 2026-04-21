var express = require('express');
var router = express.Router();

var nhanVienModel = require('../models/NhanVien'); 


router.get('/', async (req, res) => {
    try {
        // Nhìn lên thanh địa chỉ xem khách có đang tìm từ khóa nào không
        var tuKhoaTimKiem = req.query.tuKhoa; 
        
        // mặc định để trống là lấy hết
        var dieuKienLoc = {}; 

        // Nếu người dùng có nhập chữ, nhét điều kiện tìm kiếm vào giỏ
        if (tuKhoaTimKiem) {
            // Lệnh RegExp('i'):tìm gần đúng và không phân biệt chữ Hoa/thường
            dieuKienLoc = { MaCanBo: new RegExp(tuKhoaTimKiem, 'i') }; 
        }

        // Cầm cái giỏ điều kiện vào Database lấy dữ liệu ra
        var danhSachNhanVien = await nhanVienModel.find(dieuKienLoc); 
        
        // 5. Gửi danh sách kèm theo cái từ khóa cũ ra giao diện (để in lại lên ô nhập)
        res.render('nhanvien', { 
            danhSach: danhSachNhanVien,
            tuKhoa: tuKhoaTimKiem 
        });
        
    } catch (error) {
        console.log("Lỗi lấy dữ liệu:", error);
        res.send("Có lỗi xảy ra khi lấy danh sách nhân viên!");
    }
});

//Khi yêu cầu vào ThêmNV -> Mở tờ giấy Form 
router.get('/them', (req, res) => {
    res.render('NhanVien_Them'); 
});

// 2. Khi bấm "Lưu"-> Lấy dữ liệu đẩy vào Database
router.post('/them', async (req, res) => {
    try {
        var duLieuForm = req.body;
        
        // Kiểm tra xem MaNV bi trùng
        var tonTai = await nhanVienModel.findOne({ MaCanBo: duLieuForm.MaCanBo });
        
        if (tonTai) {
           
            return res.render('NhanVien_Them', { 
                error: "Mã nhân viên này đã tồn tại!", 
                oldData: duLieuForm // Gửi lại dữ liệu cũ để không phải nhập lại từ đầu
            });
        }

        //Nếu không trùng thì lưu bình thường
        var nhanVienMoi = new nhanVienModel(duLieuForm);
        await nhanVienMoi.save();
        res.redirect('/nhanvien');
        
    } catch (error) {
        console.log("Lỗi:", error);
        res.render('NhanVien_Them', { error: "Có lỗi xảy ra, vui lòng thử lại!", oldData: req.body });
    }
});

//  Xóa nhân viên-> Lấy ID trên thanh địa chỉ và xóa
router.get('/xoa/:id', async (req, res) => {
    try {
        // Lấy cái ID bí mật đã tạo
        var idCanXoa = req.params.id; 
        
        // tìm đúng ID đó và tiêu hủy
        await nhanVienModel.findByIdAndDelete(idCanXoa);
        
        //load lại trang danh sách
        res.redirect('/nhanvien'); 
        
    } catch (error) {
        console.log("Lỗi khi xóa nhân viên:", error);
        res.send("<h1>Lỗi! Không thể xóa nhân viên này.</h1>");
    }
});

// Mở form Sửa-> Lấy dữ liệu cũ in ra form
router.get('/sua/:id', async (req, res) => {
    try {
        var idCanSua = req.params.id;
        // Tìm nhân viên đó trong Database
        var nhanVienCu = await nhanVienModel.findById(idCanSua);
        
        // Gửi dữ liệu cũ sang file giao diện NhanVien_Sua để điền sẵn vào ô trống
        res.render('NhanVien_Sua', { nhanVien: nhanVienCu });
    } catch (error) {
        console.log("Lỗi khi mở form sửa:", error);
        res.send("<h1>Lỗi! Không tìm thấy nhân viên.</h1>");
    }
});

//Lưu thông tin Sửa-> Nhận form mới và đè lên data cũ
router.post('/sua/:id', async (req, res) => {
    try {
        var idCanSua = req.params.id;
        var duLieuMoi = req.body;
        
        // Update đè dữ liệu mới lên
        await nhanVienModel.findByIdAndUpdate(idCanSua, duLieuMoi);
        
        // về lại trang danh sách
        res.redirect('/nhanvien');
    } catch (error) {
        console.log("Lỗi khi cập nhật:", error);
        res.send("<h1>Lỗi! Không thể cập nhật.</h1>");
    }
});
module.exports = router;