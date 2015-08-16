var config = module.exports = {};

config.PORT = 3300;
config.HOST = '0.0.0.0';

config.ENVIRONMENT = process.env.NODE_ENV || 'development';

if (config.ENVIRONMENT == 'development') {
	config.LIVERELOAD_PORT = 3301;
}
