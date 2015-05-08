var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var MongoId = require('mongodb').ObjectID;
var mongoURL = 'mongodb://localhost:27017/sip';

/* GET users listing. */

router.get(/[A-Z]/, function(req, res, next) {
	res.writeHead(301, {
		'location': '.'+req.url.toLowerCase()
	});
	res.end();
})

router.get('/:query', function(req, res, next) {
	var title = 'Search' + (req.params.query ? ': ' + req.params.query : '');

	MongoClient.connect(mongoURL, function(err, db) {
		assert.equal(err, null);
		getDrink(db, req.params.query, function(result) {
			var checked = 0;
			result.ingredients.forEach(function(e, i, a) {
				getIngredient(db, e.id, function(ingDoc) {
					for (var attr in ingDoc) e[attr] = ingDoc[attr];
					if (++checked == a.length) {
						db.close();
						res.render('drink', {
							drink: result,
							title: result.name + ' Recipe'
						});
					}
				});
			});
		});
	});
});

router.get('/', function(req, res, next) {
	res.writeHead(301, {
		'location': '../'
	});
	res.end();
});

var getDrink = function(db, query, callback) {
	var drink = {};
	var result = db.collection('drinks').find({
		'urlsafename': query
	}, {
		'multi': false
	});
	result.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			drink = doc;
		} else {
			callback(drink);
		}
	});
}

var getIngredient = function(db, id, callback) {
	var ingredient = {};
	var result = db.collection('ingredients').find({
		'_id': id
	});
	result.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			console.log(doc.name);
			for (var attr in doc) ingredient[attr] = doc[attr];
		} else {
			callback(ingredient);
		}
	})
}

module.exports = router;
