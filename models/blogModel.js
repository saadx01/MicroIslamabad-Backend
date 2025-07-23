import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  sector: { 
    type: String, 
    required: true 
  },
  category: {
    type: String,
    enum: [
      "Restaurants",
      "Parks & Grounds",
      "Gyms & Pools",
      "Cafes & Desserts",
      "Activities & Events"
    ],
    required: true
  },
  coverImage: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published"
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const BlogModel = mongoose.model("Blog", blogSchema);
export default BlogModel;
