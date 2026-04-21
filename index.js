var express = require('express');
var mongoose = require('mongoose');
var session = require('express-session'); 
var bodyParser = require('body-parser');

const nhanVienModel = require('./models/NhanVien'); 

var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Dịch dữ liệu từ Form 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cài đặt "Trí nhớ" cho hệ thống 
app.use(session({
    secret: 'hethongluong_secret_key_2026', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

// lấy biến 'user' ra toàn bộ giao diện  để trang nào cũng gọi được tên
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Kết nối Database MongoDB Atlas
var uri = 'mongodb://huynhnhu6022:0941@ac-xivdur8-shard-00-01.klcbfdf.mongodb.net:27017/QuanLyLuong?ssl=true&authSource=admin';
mongoose.connect(uri) 
    .then(() => console.log('✅ Đã kết nối thành công tới Database QuanLyLuong trên MongoDB Atlas!'))
    .catch(err => console.error('❌ Lỗi kết nối Database:', err));



const kiemTraKeToan = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Chưa đăng nhập -> Đuổi ra
    }
    if (req.session.user.VaiTro === 'Kế toán') {
        next(); // Là kế toán -> Cho phép đi tiếp vào phòng
    } else {
        res.status(403).send("<h1>CẢNH BÁO:</h1> Bạn là Nhân viên, không có quyền truy cập chức năng của Kế Toán!");
    }
};


var nhanvien = require('./routers/nhanvien'); 
app.use('/nhanvien', kiemTraKeToan, nhanvien);

var hopDong = require('./routers/hopdong');
app.use('/hopdong', kiemTraKeToan, hopDong);

var chamCong = require('./routers/chamcong');
app.use('/chamcong', kiemTraKeToan, chamCong);

var bangLuong = require('./routers/bangluong');
app.use('/bangluong', kiemTraKeToan, bangLuong);

var me = require('./routers/me');
app.use('/me', me);

var dashboard = require('./routers/dashboard');
app.use('/dashboard', kiemTraKeToan, dashboard); 

// CHỨC NĂNG ĐĂNG NHẬP / ĐĂNG XUẤT / ĐỔI MẬT KHẨU

app.get('/login', (req, res) => {
    if (req.session.user) {
        if (req.session.user.VaiTro === 'Kế toán') return res.redirect('/bangluong');
        else return res.redirect('/me/phieuluong');
    }
    res.render('login'); 
});

app.post('/login', async (req, res) => {
    try {
        var nv = await nhanVienModel.findOne({ 
            MaCanBo: req.body.MaCanBo, 
            MatKhau: req.body.MatKhau 
        });

        if (nv) {
            req.session.user = {
                MaCanBo: nv.MaCanBo,
                HoVaTen: nv.HoVaTen,
                VaiTro: nv.VaiTro || 'Nhân viên'
            };
			
			if (req.session.user.VaiTro === 'Kế toán') {
				res.redirect('/dashboard'); // Đăng nhập xong đẩy thẳng sếp vào trang Tổng quan cho oai
			} else {
				res.redirect('/me/phieuluong');
			}


        } else {
            res.render('login', { error: 'Mã cán bộ hoặc mật khẩu không chính xác!' });
        }
    } catch (error) {
        console.log(error);
        res.render('login', { error: 'Lỗi hệ thống!' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(); 
    res.redirect('/login');
});

app.get('/doimatkhau', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('doimatkhau', { user: req.session.user });
});

app.post('/doimatkhau', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    try {
        if (req.body.MatKhauMoi !== req.body.XacNhanMatKhau) {
            return res.render('doimatkhau', { error: "Mật khẩu xác nhận không khớp!", user: req.session.user });
        }
        var nv = await nhanVienModel.findOne({ MaCanBo: req.session.user.MaCanBo });
        if (nv.MatKhau !== req.body.MatKhauCu) {
            return res.render('doimatkhau', { error: "Mật khẩu hiện tại không đúng!", user: req.session.user });
        }
        nv.MatKhau = req.body.MatKhauMoi;
        await nv.save();
        res.send("<script>alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.'); window.location.href='/logout';</script>");
    } catch (error) {
        res.render('doimatkhau', { error: "Có lỗi xảy ra!", user: req.session.user });
    }
});

// Trang chủ mặc định cũng trở về trang Login 
app.get('/', (req, res) => {
    res.redirect('/login');
});

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const NhanVien = require('./models/nhanvien');
const BangLuong = require('./models/bangluong');

// 1. CẤU HÌNH GMAIL GỬI ĐI
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'huynhnhu6022@gmail.com', // Email của Như
        pass: 'zpxkrkienehwrvkw'    // DÁN MẬT KHẨU ỨNG DỤNG 16 KÝ TỰ VÀO ĐÂY
    }
});

// 2. LẬP LỊCH TỰ ĐỘNG: 09:00 SÁNG NGÀY 10 HÀNG THÁNG
// Cấu trúc Cron: Phút | Giờ | Ngày | Tháng | Thứ
cron.schedule('0 9 10 * *', async () => {
    console.log("--- BẮT ĐẦU QUY TRÌNH GỬI LƯƠNG TỰ ĐỘNG ---");

    try {
        // Lấy tháng vừa rồi (Ví dụ tháng 4 thì gửi lương tháng 3)
        let now = new Date();
        let thang = now.getMonth(); // getMonth trả về 0-11, nên nó chính là tháng trước
        let nam = now.getFullYear();
        if (thang === 0) { thang = 12; nam -= 1; }

        // Tìm tất cả bảng lương của tháng đó
        const dsLuong = await BangLuong.find({ Thang: thang, Nam: nam });

        for (let bl of dsLuong) {
            // Tìm thông tin nhân viên để lấy Email
            const nv = await NhanVien.findOne({ MaCanBo: bl.MaCanBo });

            if (nv && nv.Email) {
                // SOẠN NỘI DUNG EMAIL (HTML cho đẹp)
                const mailOptions = {
                    from: '"Phòng Kế Toán" <huynhnhu6022@gmail.com>',
                    to: nv.Email,
                    subject: `[PHIẾU LƯƠNG] - Tháng ${thang}/${nam}`,
                    html: `
                        <div style="font-family: Arial; border: 1px solid #007355; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #007355; text-align: center;">THÔNG BÁO LƯƠNG CHI TIẾT</h2>
                            <p>Chào bạn <b>${nv.HoVaTen}</b>,</p>
                            <p>Phòng kế toán gửi bạn chi tiết bảng lương tháng ${thang}/${nam}:</p>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px; border: 1px solid #eee;">Mã nhân viên:</td><td><b>${bl.MaCanBo}</b></td></tr>
                                <tr><td style="padding: 8px; border: 1px solid #eee;">Lương cơ bản:</td><td>${bl.LuongCoBan.toLocaleString()}đ</td></tr>
                                <tr><td style="padding: 8px; border: 1px solid #eee;">Phụ cấp & Thưởng:</td><td style="color: green;">+ ${(bl.TongPhuCap + bl.Thuong).toLocaleString()}đ</td></tr>
                                <tr><td style="padding: 8px; border: 1px solid #eee;">Khấu trừ (BH/Phạt):</td><td style="color: red;">- ${(bl.BaoHiem + bl.Phat).toLocaleString()}đ</td></tr>
                                <tr style="background: #f0fdf4;"><td style="padding: 8px; border: 1px solid #eee;"><b>THỰC LÃNH:</b></td><td style="color: #007355; font-size: 18px;"><b>${bl.ThucLanh.toLocaleString()}đ</b></td></tr>
                            </table>
                            <p style="margin-top: 20px; font-size: 12px; color: #999;">*Đây là email tự động, vui lòng không phản hồi thư này.</p>
                        </div>
                    `
                };

                // GỬI THƯ
                await transporter.sendMail(mailOptions);
                console.log(`✅ Đã gửi mail cho: ${nv.HoVaTen} (${nv.Email})`);
            }
        }
        console.log("--- HOÀN TẤT GỬI LƯƠNG THÁNG ---");
    } catch (error) {
        console.error("❌ Lỗi hệ thống gửi mail:", error);
    }
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:3000`);
});