const express = require('express');
const router = express.Router();
const chamCongModel = require('../models/chamcong');


router.get('/', async (req, res) => {
    try {
        var tuKhoa = req.query.tuKhoa;
        var thang = req.query.thang || new Date().getMonth() + 1; 
        var nam = req.query.nam || new Date().getFullYear();

        var dieuKien = { Thang: thang, Nam: nam };
        
        if (tuKhoa) {
            dieuKien.MaCanBo = new RegExp(tuKhoa, 'i');
        }

        var danhSachCC = await chamCongModel.find(dieuKien);
        res.render('chamcong', { 
            danhSach: danhSachCC, 
            tuKhoa: tuKhoa,
            thang: thang,
            nam: nam
        });
    } catch (error) {
        console.log(error);
        res.send("Lỗi tải danh sách chấm công!");
    }
});


router.get('/them', (req, res) => {
    var thangHienTai = new Date().getMonth() + 1;
    var namHienTai = new Date().getFullYear();
    res.render('ChamCong_Them', { thangDef: thangHienTai, namDef: namHienTai });
});

router.post('/them', async (req, res) => {
    try {
        var duLieu = req.body;

        // Kiểm tra xem nhân viên này đã chấm công tháng đó chưa
        var tonTai = await chamCongModel.findOne({ 
            MaCanBo: duLieu.MaCanBo, 
            Thang: duLieu.Thang, 
            Nam: duLieu.Nam 
        });

        if (tonTai) {
            return res.render('ChamCong_Them', { 
                error: `Nhân viên ${duLieu.MaCanBo} đã được chấm công trong tháng ${duLieu.Thang}/${duLieu.Nam}!`,
                oldData: duLieu,
                thangDef: duLieu.Thang,
                namDef: duLieu.Nam
            });
        }

        // Nếu chưa có thì lưu mới
        var chamCongMoi = new chamCongModel(duLieu);
        await chamCongMoi.save();
        res.redirect('/chamcong');

    } catch (error) {
        console.log("Lỗi lưu chấm công:", error);
        res.render('ChamCong_Them', { 
            error: "Có lỗi xảy ra, vui lòng kiểm tra lại!", 
            oldData: req.body,
            thangDef: req.body.Thang,
            namDef: req.body.Nam
        });
    }
});

// ==========================================
// 4. XÓA CHẤM CÔNG (Bấm thùng rác)
// ==========================================
router.get('/xoa/:id', async (req, res) => {
    try {
        await chamCongModel.findByIdAndDelete(req.params.id);
        res.redirect('/chamcong');
    } catch (error) {
        console.log("Lỗi xóa chấm công:", error);
        res.send("Lỗi không thể xóa dữ liệu!");
    }
});

router.get('/sua/:id', async (req, res) => {
    try {
        var cc = await chamCongModel.findById(req.params.id);
        if (!cc) return res.send("Không tìm thấy dữ liệu chấm công này!");
        res.render('ChamCong_Sua', { chamCong: cc });
    } catch (error) {
        console.log("Lỗi lấy data CC:", error);
        res.send("Lỗi tải trang sửa chấm công!");
    }
});


router.post('/sua/:id', async (req, res) => {
    try {
        await chamCongModel.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/chamcong');
    } catch (error) {
        console.log("Lỗi cập nhật CC:", error);
        res.send("Lỗi không thể cập nhật dữ liệu!");
    }
});
module.exports = router;