const express = require('express');
const router = express.Router();
const bangLuongModel = require('../models/BangLuong');


router.get('/phieuluong', async (req, res) => {
    try {
        // Nếu chưa đăng nhập thì ra trang login
        if (!req.session.user) return res.redirect('/Login');

        var thang = req.query.thang || new Date().getMonth() + 1;
        var nam = req.query.nam || new Date().getFullYear();

        // CHỈ TÌM lương của chính người đang đăng nhập (req.session.user.MaCanBo)
        var phieuLuong = await bangLuongModel.findOne({ 
            MaCanBo: req.session.user.MaCanBo, 
            Thang: thang, 
            Nam: nam 
        });

        res.render('me/PhieuLuong', { 
            phieu: phieuLuong, 
            thang: thang, 
            nam: nam,
            user: req.session.user 
        });
    } catch (error) {
        console.log(error);
        res.send("Lỗi khi tải phiếu lương!");
    }
});

module.exports = router;