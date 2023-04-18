/**
 * Test configuration for the Odyssey Stats.
 *
 * Will match files such that:
 *   1. Must be in the apps/odyssey-stats/ directory
 *   2. Must have .test.EXT at the end of the filename
 *   3. EXT (above) must be one of js, ts, jsx, or tsx.
 */

const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );
// @wordpress/scripts manually adds additional Jest config ontop of
// @wordpress/jest-preset-default so we pull in this file to extend it
const defaults = require( '@wordpress/scripts/config/jest-unit.config.js' );

// Basically, CWD, so 'apps/odyssey-stats'.
// Without this, it tries to use 'apps/odyssey-stats/bin'
const pluginRoot = path.resolve( './' );

const config = {
	...base,
	...defaults,
	rootDir: path.normalize( '../../' ), // To detect wp-calypso root node_modules
	testMatch: [ `${ pluginRoot }/**/?(*.)test.[jt]s?(x)` ],
	transform: { '^.+\\.[jt]sx?$': path.join( __dirname, 'bin', 'babel-transform' ) },
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [
		...( defaults.setupFilesAfterEnv || [] ), // extend if present
	],
};

module.exports = config;
