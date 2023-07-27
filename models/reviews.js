const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    default: 5,
    enum: [1, 2, 3, 4, 5],
  },
  body: {
    type: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: `User`,
  },
});

module.exports = mongoose.model(`Review`, reviewSchema);
