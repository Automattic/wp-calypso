const pkg = require( '../../../../desktop/package.json' );
const config = require( '../../config.json' );

// Merge in some details from package.json
config.name = pkg.productName;
config.description = 'WordPress Desktop';
config.version = pkg.version;
config.author = pkg.author;

config.loginURL = function () {
	if ( process.env.WP_DESKTOP_DEBUG_LOCALHOST !== undefined ) {
		return 'http://calypso.localhost:3000/log-in';
	}
	return 'https://wordpress.com/log-in';
};

config.baseURL = function () {
	if ( process.env.WP_DESKTOP_DEBUG_LOCALHOST !== undefined ) {
		return 'http://calypso.localhost:3000/';
	}
	return 'https://wordpress.com/';
};

config.isRelease = function () {
	return this.build === 'release';
};

config.isUpdater = function () {
	return this.build === 'updater';
};

config.isBeta = function () {
	return this.build === 'beta';
};

// Do not send function and DOM objects (exception in Electron v9).
config.toRenderer = function () {
	return {
		build: this.build,
		version: this.version,
	};
};

module.exports = config;
