const mongoose = require('mongoose');

const ChucVuSchema = new mongoose.Schema({
    MaCV: { type: String, required: true, unique: true }, 
    TenChucVu: { type: String, required: true },          
    HeSoPhuCap: { type: Number, default: 1.0 }            
});

const chucVuModel = mongoose.model('ChucVu', ChucVuSchema);
module.exports = chucVuModel;