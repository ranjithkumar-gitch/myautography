const mongoose = require('mongoose');

const otpschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    otpHash: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        enum: ['email', 'sms'],
        required: true,
        default: 'sms',
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    attempAt: {
        type: Number,
        default: 0,
    },
    isverified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpschema);