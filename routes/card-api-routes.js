const express = require('express');


const ensureLoggedInApiVersion = require('../lib/ensure-logged-in-api-version');
const ListModel = require('../models/list-model');
const CardModel = require('../models/card-model');


const router = express.Router();


router.post('/api/lists/:id/cards', ensureLoggedInApiVersion, (req, res, next) => {
    CardModel
      .findOne({ list: req.params.id })
      .sort({ position: -1 })   // -1 means opposite order (3-2-1)
      .exec((err, lastCard) => {
          if (err) {
            res.status(500).json({ message: 'Find Card went to 💩.' });
            return;
          }

          // default to 1 if there are no cards (new list)
          let newPosition = 1;

          if (lastCard) {
            // but use the last card's position (+1) if we have one
            newPosition = lastCard.position + 1;
          }

          const theCard = new CardModel({
            title: req.body.cardTitle,
            position: newPosition,
            list: req.params.id
          });

          theCard.save((err) => {
              if (err) {
                res.status(500).json({ message: 'Card save went to 💩.' });
                return;
              }

              ListModel.findByIdAndUpdate(
                req.params.id,
                { $push: { cards: theCard._id } },
                (err, listFromDb) => {
                    if (err) {
                      res.status(500).json({ message: 'List update went to 💩.' });
                      return;
                    }

                    res.status(200).json(theCard);
                }
              );
          });
      }); // close exec()
}); // close post '/api/lists/:id/cards'


router.patch('/api/cards/:id', ensureLoggedInApiVersion, (req, res, next) => {
    CardModel.findById(
      req.params.id,
      (err, cardFromDB) => {
          if (err) {
              res.status(500).json({ message: 'Card find went to 💩.' });
              return;
          }

          // Separate if statements to avoid blanking out fields
          // (in case user sends only "description" for example)
          if (req.body.cardTitle) {
            cardFromDB.title = req.body.cardTitle;
          }

          if (req.body.cardDescription) {
            cardFromDB.description = req.body.cardDescription;
          }

          if (req.body.cardDueDate) {
            cardFromDB.dueDate = req.body.cardDueDate;
          }

          cardFromDB.save((err) => {
              if (err) {
                  res.status(500).json({ message: 'Card save went to 💩.' });
                  return;
              }

              res.status(200).json(cardFromDB);
          });
      }
    ); // close findById
}); // close patch '/api/cards/:id'


router.delete('/api/cards/:id', ensureLoggedInApiVersion, (req, res, next) => {
    CardModel.findByIdAndRemove(
        req.params.id,
        (err, cardFromDB) => {
            if (err) {
                res.status(500).json({ message: 'Card remove went to 💩.' });
                return;
            }

            ListModel.findByIdAndUpdate(
              cardFromDB.list,
              { $pull: { cards: cardFromDB._id } },
              (err) => {
                  if (err) {
                      res.status(500).json({ message: 'List update went to 💩.' });
                      return;
                  }

                  res.status(200).json(cardFromDB);
              }
            );
        }
    ); // close findByIdAndRemove
}); // close delete '/api/cards/:id'


module.exports = router;
