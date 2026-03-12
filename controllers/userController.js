const User = require("../model/User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");  
        if (!user) {    
            return res.status(404).json({ message: "User not found" }); 
        }
        res.json(user);
    }   
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }   
};
//update profile controller
exports.updateProfile = async (req, res) => {
    try {   
        const { username, phone, dateOfBirth,email,address,profileImage  } = req.body;
        const user = await User.findById(req.user.userId);  
        if (!user) {    
            return res.status(404).json({ message: "User not found" }); 
        }
        user.username = username || user.username;
        user.phone = phone || user.phone;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth; 
        user.email = email || user.email;
        user.address = address || user.address;
        user.profileImage = profileImage || user.profileImage;
        await user.save();
        res.json({ message: "Profile updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
//update cover image controller
exports.updateCoverImage = async (req, res) => {
    try {
        const { coverImage } = req.body;
        const user =    await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.coverImage = coverImage || user.coverImage;
        await user.save();
        res.json({ message: "Cover image updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }   
};
//follow star controller ->Star can follow Star, ->Stargazer can follow Star, ->But cannot follow Stargazer
exports.followStar = async (req, res) => {
    try {
        const starId = req.params.starId;
        const user = await User.findById(req.user.userId);
        const star = await User.findById(starId);   
        if (!user || !star) {
            return res.status(404).json({ message: "User or Star not found" });
        }  
        if (user.role === "stargazer" && star.role !== "star") {
            return res.status(400).json({ message: "Stargazers can only follow Stars" });
        }   
        if (user.role === "star" && star.role !== "star") {
            return res.status(400).json({ message: "Stars can only follow Stars" });
        }   
        if (user.following.includes(starId)) {  
            return res.status(400).json({ message: "Already following this star" });
        }   
        user.following.push(starId);
        star.followers.push(user._id);
        await user.save();
        await star.save();
        res.json({ message: "Star followed successfully" });
    }   
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }   
}; 

            


