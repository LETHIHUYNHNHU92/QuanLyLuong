const express = require('express');
const router = express.Router();
const bangLuongModel = require('../models/BangLuong');
const hopDongModel = require('../models/HopDong');
const chamCongModel = require('../models/ChamCong');
const nhanVienModel = require('../models/NhanVien'); 

function tinhThueTNCN(thuNhapTinhThue) {
    if (thuNhapTinhThue <= 0) return 0;
    
    let tntt = thuNhapTinhThue / 1000000; 
    let thue = 0;

    if (tntt <= 5) thue = tntt * 0.05;
    else if (tntt <= 10) thue = (tntt * 0.1) - 0.25;
    else if (tntt <= 18) thue = (tntt * 0.15) - 0.75;
    else if (tntt <= 32) thue = (tntt * 0.2) - 1.65;
    else if (tntt <= 52) thue = (tntt * 0.25) - 3.25;
    else if (tntt <= 80) thue = (tntt * 0.3) - 5.85;
    else thue = (tntt * 0.35) - 9.85;

    return Math.round(thue * 1000000); 
}

// HIỂN THỊ BẢNG LƯƠNG
router.get('/', async (req, res) => {
    var thang = req.query.thang || new Date().getMonth() + 1;
    var nam = req.query.nam || new Date().getFullYear();
    
    var danhSach = await bangLuongModel.find({ Thang: thang, Nam: nam });
    res.render('BangLuong', { danhSach: danhSach, thang: thang, nam: nam });
});


// CHẠY BẢNG LƯƠNG
router.get('/TinhLuong', async (req, res) => {
    try {
        var thang = req.query.thang;
        var nam = req.query.nam;
        
        // Xóa bảng lương cũ của tháng đó
        await bangLuongModel.deleteMany({ Thang: thang, Nam: nam });

        // Gom dữ liệu
        var dsChamCong = await chamCongModel.find({ Thang: thang, Nam: nam });

        for (let cc of dsChamCong) {
            var hd = await hopDongModel.findOne({ MaCanBo: cc.MaCanBo });
            var nv = await nhanVienModel.findOne({ MaCanBo: cc.MaCanBo }); 
            
            if (hd && nv) {
                // 1. CHUYỂN HÓA DỮ LIỆU AN TOÀN 
                var tienThuong = cc.TienThuong || 0;
                var tienPhat = cc.TienPhat || 0;
                var tienTamUng = cc.TienTamUng || 0;
                var soGioTangCa = cc.SoGioTangCa || 0;
                var soNgayNghiCoPhep = cc.SoNgayNghiCoPhep || 0;
                var soNguoiPhuThuoc = nv.NguoiPhuThuoc || 0;
                
                // 2. TÍNH TOÁN
                var tongNgayTinhLuong = cc.SoNgayLamViec + soNgayNghiCoPhep;
                var luongThucTe = (hd.LuongCoBan / 26) * tongNgayTinhLuong;
                
                var luongMotGio = hd.LuongCoBan / 26 / 8;
                var tienTangCa = soGioTangCa * luongMotGio * 1.5;
                
                var tongPhuCap = hd.PhuCapAnUong + hd.PhuCapDiLai;
                
                var tongThuNhap = luongThucTe + tienTangCa + tongPhuCap + tienThuong;
                
                var tienBaoHiem = hd.LuongCoBan * 0.105; 
                        
                var giamTruGiaCanh = 15500000 + (soNguoiPhuThuoc * 6200000);
                
                var thuNhapTinhThue = tongThuNhap - tienBaoHiem - giamTruGiaCanh;
                var tienThue = tinhThueTNCN(thuNhapTinhThue);
                
                
                var thucLanh = Math.round(tongThuNhap - tienBaoHiem - tienThue - tienPhat - tienTamUng);

                // 3. LƯU XUỐNG DATABASE
                var luongMoi = new bangLuongModel({
                    MaCanBo: cc.MaCanBo,
                    Thang: thang,
                    Nam: nam,
                    LuongCoBan: hd.LuongCoBan,
                    SoNgayLam: cc.SoNgayLamViec,
                    TongPhuCap: tongPhuCap,
                    Thuong: tienThuong,
                    Phat: tienPhat,
                    TamUng: tienTamUng,
                    BaoHiem: tienBaoHiem,
                    GiamTruGiaCanh: giamTruGiaCanh,
                    ThueTNCN: tienThue,
                    ThucLanh: thucLanh
                });
                await luongMoi.save();
            }
        }
        
        res.redirect(`/BangLuong?thang=${thang}&nam=${nam}`);

    } catch (error) {
        console.log("Lỗi tính lương:", error);
        res.send("Hệ thống gặp sự cố khi chạy bảng lương!");
    }
});

//gg sheet
const { google } = require('googleapis');
const BangLuong = require('../models/BangLuong');
const NhanVien = require('../models/NhanVien');

router.get('/xuat-google-sheet', async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'google-key.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'], 
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const spreadsheetId = '1wlX-tWgG5QrxtEvEvL1-XHbRVNDcX831dgWvkLJUJzw'; 

        // 1. Lấy dữ liệu từ Database
        let now = new Date();
        let thang = now.getMonth() + 1;
        let nam = now.getFullYear();

        const dsLuong = await BangLuong.find({ Thang: thang, Nam: nam });
        let rows = [
            ['STT', 'Mã NV', 'Họ Tên', 'Lương Cơ Bản', 'Phụ Cấp', 'Khấu Trừ', 'Thực Lãnh']
        ];

        let i = 1;
        for (let bl of dsLuong) {
            const nv = await NhanVien.findOne({ MaCanBo: bl.MaCanBo });
            rows.push([
                i++,
                bl.MaCanBo,
                nv ? nv.HoVaTen : 'N/A',
                bl.LuongCoBan,
                bl.TongPhuCap + bl.Thuong,
                bl.BaoHiem + bl.Phat,
                bl.ThucLanh
            ]);
        }

        // 2. Xóa dữ liệu cũ trong file (để ghi tháng mới vào)
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: 'Sheet1!A:G',
        });

        // 3. Ghi dữ liệu mới vào bằng Google Sheets API
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            resource: { values: rows },
        });

        // 4.Tự động tải file thẳng về máy tính kế toán dưới dạng Excel
        const downloadUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
        
        res.send(`
            <script>
                // Mở link tải file ẩn
                window.open('${downloadUrl}', '_self');
                alert('Dữ liệu đã được ghi vào Google Sheets và đang tải xuống máy tính của bạn!');
                setTimeout(() => { window.location.href = '/bangluong'; }, 1000);
            </script>
        `);

    } catch (error) {
        console.error("Lỗi rồi:", error);
        res.status(500).send("Lỗi xuất file!");
    }
});
module.exports = router;