var mongoose = require('mongoose');

module.exports = function () {
    mongoose.connect("mongodb://jack:jack@ds143245.mlab.com:43245/confer", {useMongoClient: true});
    
    mongoose.Promise = global.Promise;
    var db = mongoose.connection;
    
    db.once('open', function() {
        console.log('DB connection established');
    });

    db.on('error', function() {
        console.log('DB connection not established'); 
    });    
}