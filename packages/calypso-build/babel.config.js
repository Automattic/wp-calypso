/*
 * Only for `bin/transpile`.
 * Don't use this in your projects -- use `@automattic/calypso-build/babel/default instead.
 */

/**
 * External dependencies
 */
const path = require( 'path' );

module.exports = {
	presets: [ path.join( __dirname, 'babel', 'default' ) ],
};
