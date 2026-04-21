const mongoose = require('mongoose');

const PhuCapSchema = new mongoose.Schema({
    MaPC: { type: String, required: true, unique: true }, 
    TenPhuCap: { type: String, required: true },          
    SoTien: { type: Number, required: true }              
});

const phuCapModel = mongoose.model('PhuCap', PhuCapSchema);
module.exports = phuCapModel;