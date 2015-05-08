var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var MongoId = require('mongodb').ObjectID;
var mongoURL = 'mongodb://localhost:27017/sip';

/* GET users listing. */
router.get('/:query?', function(req, res, next) {
  var title = 'Search'+(req.params.query ? ': '+req.params.query : '');

  MongoClient.connect(mongoURL,function(err,db) {
    assert.equal(err,null);
    searchIngredients(db,req.params.query || null,function(results){
      res.render('search', {title: title, results: results});
      db.close();
    });
  });
});

var searchIngredients = function(db, query, callback) {
  var resultsObject = {};
  if (query)
    resultsObject = db.collection('ingredients').find( {
      $text: { 
        $search: query
      }
    } , {
      score: {
        $meta: 'textScore'
      }
    }).sort( { score: { $meta: 'textScore' } } );
  else
    resultsObject = db.collection('ingredients').find();
  var resultsArray = [];
  resultsObject.each(function(err,doc) {
    assert.equal(err,null);
    if (doc != null) {
      resultsArray.push(doc);
    } else {
      callback(resultsArray);
    }
  })
}

module.exports = router;
