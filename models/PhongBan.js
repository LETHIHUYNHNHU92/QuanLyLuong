const mongoose = require('mongoose');

const PhongBanSchema = new mongoose.Schema({
    MaPB: { type: String, required: true, unique: true }, 
    TenPhongBan: { type: String, required: true },        
    MoTa: { type: String }                                
});

const phongBanModel = mongoose.model('PhongBan', PhongBanSchema);
module.exports = phongBanModel;