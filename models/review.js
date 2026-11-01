const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: String,

  rating: {
    type: Number,
    min: 0.5,
    max: 5,
    required: true,
    validate: {
      validator: function (value) {
        return Number.isInteger(value * 2);
      },
      message: "Rating must be in 0.5 increments.",
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
