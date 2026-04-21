const express = require('express');
const router = express.Router();
const nhanVienModel = require('../models/NhanVien');
const BangLuong = require('sBangLuong');


router.get('/', async (req, res) => {
    try {
        // 1. Đếm tổng số nhân viên 
        const tongNV = await nhanVienModel.countDocuments();

        // 2. Tính tổng quỹ lương tháng gần nhất 
        const duLieuLuong = await BangLuong.aggregate([
            { $match: { Thang: 4, Nam: 2026 } },
            { $group: { _id: null, tong: { $sum: "$ThucLanh" } } }
        ]);
        const tongQuyLuong = duLieuLuong.length > 0 ? duLieuLuong[0].tong : 0;

        // 3. Thống kê mỗi phòng ban có bao nhiêu người 
        const tkPhongBan = await nhanVienModel.aggregate([
            { $group: { _id: "$PhongBan", count: { $sum: 1 } } }
        ]);

        // Gửi dữ liệu ra file giao diện dashboard.ejs
        res.render('dashboard', { 
            tongNV, 
            tongQuyLuong, 
            tkPhongBan,
            user: req.session.user 
        });
    } catch (error) {
        console.log(error);
        res.send("Lỗi tải trang tổng quan");
    }
});

module.exports = router;