const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const myListSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    position: { type: Number },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Card'
      }
    ]
  },
  {
    timestamps: true
  }
);

const ListModel = mongoose.model('List', myListSchema);


module.exports = ListModel;
