var mongoose = require("mongoose"),
    faqSchema = new mongoose.Schema({
        question: String,
        answer: String,
        image: String
    });
    
module.exports = mongoose.model('faq', faqSchema);