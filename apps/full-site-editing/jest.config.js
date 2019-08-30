// @wordpress/scripts manually adds additional Jest config ontop of
// @wordpress/jest-preset-default so we pull in this file to extend it
const defaults = require( '@wordpress/scripts/config/jest-unit.config.js' );

module.exports = {
	...defaults,
	moduleDirectories: [
		...( defaults.moduleDirectories || [] ), // extend if present
		'<rootDir>/test/client',
		'<rootDir>',
		'node_modules',
	],
};
