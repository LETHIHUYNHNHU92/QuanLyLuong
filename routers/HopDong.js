const express = require('express');
const router = express.Router();
const hopDongModel = require('../models/HopDong');

router.get('/', async (req, res) => {
    try {
        var tuKhoa = req.query.tuKhoa;
        var dieuKien = {};

        if (tuKhoa) {
            dieuKien = { MaHD: new RegExp(tuKhoa, 'i') };
        }

        var danhSachHD = await hopDongModel.find(dieuKien);
        res.render('hopdong', { danhSach: danhSachHD, tuKhoa: tuKhoa });
    } catch (error) {
        console.log(error);
        res.send("Lỗi lấy danh sách hợp đồng!");
    }
});

router.get('/them', (req, res) => {
    res.render('HopDong_Them');
});


router.post('/them', async (req, res) => {
    try {
        var duLieu = req.body;
        
        // Kiểm tra trùng MãHD
        var tonTai = await hopDongModel.findOne({ MaHD: duLieu.MaHD });
        if (tonTai) {
            return res.render('HopDong_Them', {
                error: "Mã hợp đồng này đã tồn tại!",
                oldData: duLieu
            });
        }

        var hopDongMoi = new hopDongModel(duLieu);
        await hopDongMoi.save();
        res.redirect('/hopdong');
        
    } catch (error) {
        console.log("Lỗi thêm HĐ:", error);
        res.render('HopDong_Them', { error: "Có lỗi xảy ra, vui lòng kiểm tra lại!", oldData: req.body });
    }
});

router.get('/xoa/:id', async (req, res) => {
    try {
        await hopDongModel.findByIdAndDelete(req.params.id);
        res.redirect('/hopdong');
    } catch (error) {
        console.log("Lỗi xóa HĐ:", error);
        res.send("Lỗi không thể xóa hợp đồng!");
    }
});

router.get('/sua/:id', async (req, res) => {
    try {
        var hd = await hopDongModel.findById(req.params.id);
        if (!hd) return res.send("Không tìm thấy hợp đồng!");
        res.render('HopDong_Sua', { hopDong: hd });
    } catch (error) {
        console.log("Lỗi lấy data HĐ:", error);
        res.send("Lỗi tải trang sửa hợp đồng!");
    }
});

router.post('/sua/:id', async (req, res) => {
    try {
        await hopDongModel.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/hopdong');
    } catch (error) {
        console.log("Lỗi cập nhật HĐ:", error);
        res.send("Lỗi không thể cập nhật hợp đồng!");
    }
});
module.exports = router;