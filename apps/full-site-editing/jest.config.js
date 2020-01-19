// @wordpress/scripts manually adds additional Jest config ontop of
// @wordpress/jest-preset-default so we pull in this file to extend it
const defaults = require( '@wordpress/scripts/config/jest-unit.config.js' );

module.exports = {
	...defaults,
	setupFilesAfterEnv: [
		...( defaults.setupFilesAfterEnv || [] ), // extend if present
		'<rootDir>/test/client/test-setup',
	],
};
