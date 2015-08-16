var server = require('server');
var Promise = require('bluebird');
var config = require('config');

Promise.promisify(server.listen, server)(config.PORT, config.HOST)
.then(function() {
	console.log('Server started at ' + config.HOST + ':' + config.PORT);
})
.catch(function(err) {
	console.error(err);
});
