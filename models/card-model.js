const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const myCardSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: { type: String },
    dueDate: { type: Date },
    position: { type: Number },
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const CardModel = mongoose.model('Card', myCardSchema);


module.exports = CardModel;
