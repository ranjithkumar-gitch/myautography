const User = require("../model/User");
const OTP = require("../model/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const OTP_EXPIRY_MINUTES = 5;

const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

const sendOtpInternal = async (phone, otp) => {
    // Replace this log with actual SMS provider integration like Twilio, AWS SNS, etc.
    console.log(`Sending OTP ${otp} to phone number: ${phone}`);
};

const generateOtpCode = () => {
    return String(Math.floor(1000 + Math.random() * 9000));
};

const createOtpForPhone = async (phone) => {
    const otpCode = generateOtpCode();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.findOneAndUpdate(
        { phone, channel: "sms" },
        {
            phone,
            channel: "sms",
            otpHash,
            expiresAt,
            attempAt: 0,
            isverified: false
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpInternal(phone, otpCode);
};

const verifyOtpForPhone = async (phone, otp) => {
    const otpDoc = await OTP.findOne({ phone, channel: "sms" });
    if (!otpDoc) {
        return { ok: false, code: "MISSING" };
    }

    if (otpDoc.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpDoc._id });
        return { ok: false, code: "EXPIRED" };
    }

    const isMatch = await bcrypt.compare(String(otp), otpDoc.otpHash);
    if (!isMatch) {
        otpDoc.attempAt += 1;
        await otpDoc.save();
        return { ok: false, code: "INVALID" };
    }

    otpDoc.isverified = true;
    await otpDoc.save();
    return { ok: true, otpDoc };
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, phone, dateOfBirth, otp } = req.body;

        if (!username || !email || !password || !phone) {
            return res.status(400).json({ message: "username, email, password, and phone are required" });
        }

        // Check if user already exists by email or phone
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email or phone" });
        }

        let verifiedOtpDoc = null;

        // If otp is provided, verify now. Otherwise check if already verified or send OTP.
        if (otp) {
            const otpVerification = await verifyOtpForPhone(phone, otp);
            if (!otpVerification.ok) {
                if (otpVerification.code === "MISSING") {
                    return res.status(400).json({ message: "No OTP found for this phone. Request OTP first." });
                }

                if (otpVerification.code === "EXPIRED") {
                    return res.status(400).json({ message: "OTP expired. Request a new OTP." });
                }

                return res.status(400).json({ message: "Invalid OTP" });
            }

            verifiedOtpDoc = otpVerification.otpDoc;
        } else {
            const existingOtpDoc = await OTP.findOne({ phone, channel: "sms" });
            const hasValidVerifiedOtp = existingOtpDoc && existingOtpDoc.isverified && existingOtpDoc.expiresAt > new Date();

            if (!hasValidVerifiedOtp) {
                await createOtpForPhone(phone);
                return res.status(200).json({
                    status: "pending",
                    message: "OTP sent to phone number. Verify OTP, then register new user."
                });
            }

            verifiedOtpDoc = existingOtpDoc;
        }

        // OTP verified successfully, now create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedEmail = await bcrypt.hash(email, 10); // Hash email for privacy in OTP record
        const phoneEncrypted = await bcrypt.hash(phone, 10); // Hash phone for privacy in OTP record    
        // Update OTP record with userId and hashed email for reference
        verifiedOtpDoc.userId = null; // Will set after user creation
        verifiedOtpDoc.email = encryptedEmail;
        verifiedOtpDoc.phone = phoneEncrypted;
        // await verifiedOtpDoc.save();

        const newUser = new User({
            username,
            email: encryptedEmail,
            password: hashedPassword,
            role: "stargazer",
            phone: phoneEncrypted,
            dateOfBirth,
            verificationStatus: "verified"
        });
        await newUser.save();
        await OTP.deleteOne({ _id: verifiedOtpDoc._id });

        const tokens = generateTokens(newUser);
        return res.status(200).json({
            status: "success",
            message: "User created successfully.",
            data: {
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role,
                verificationStatus: newUser.verificationStatus,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (err) {
        console.error("Register error:", err.message || err);
        return res.status(500).json({ message: "Server error", error: err.message || String(err) });
    }
};



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = await User.findOne({ email });

        // Backward-compatible fallback for records where email was stored as bcrypt hash.
        if (!user) {
            const users = await User.find({});
            for (const candidate of users) {
                if (candidate.email && await bcrypt.compare(email, candidate.email)) {
                    user = candidate;
                    break;
                }
            }
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid username" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const tokens = generateTokens(user);
        return res.status(200).json({
            status: "success",
            message: "Sign-in successful",
            data: {
                userId: user._id,
                email: user.email,
                role: user.role,
                verificationStatus: user.verificationStatus,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (err) {
        console.error("Login error:", err.message || err);
        return res.status(500).json({ message: "Server error", error: err.message || String(err) });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: "Phone is required" });
        }

        await createOtpForPhone(phone);
        return res.status(200).json({ message: `OTP sent to phone number: ${phone}` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }

        const verification = await verifyOtpForPhone(phone, otp);
        if (!verification.ok) {
            if (verification.code === "MISSING") {
                return res.status(400).json({ message: "No OTP found for this phone" });
            }

            if (verification.code === "EXPIRED") {
                return res.status(400).json({ message: "OTP expired" });
            }

            return res.status(400).json({ message: "OTP verification failed" });
        }

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};