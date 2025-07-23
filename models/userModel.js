import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        // Simple email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Please enter a valid email address"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Optional: enforce password strength
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  profileImage: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
