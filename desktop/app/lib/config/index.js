const config = require( '../../../config/config.json' );
const pkg = require( '../../../package.json' );

// Merge in some details from package.json
config.name = pkg.productName;
config.description = 'WordPress Desktop';
config.version = pkg.version;
config.author = pkg.author;

config.protocol = 'wpdesktop';

config.loginURL = function () {
	return this.baseURL() + 'log-in';
};

config.baseURL = function () {
	if ( process.env.WP_DESKTOP_BASE_URL !== undefined ) {
		return `${ process.env.WP_DESKTOP_BASE_URL }/`;
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
