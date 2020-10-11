/**
 * Test configuration for the FSE plugin.
 *
 * Will match files such that:
 *   1. Must be in the apps/editing-toolkit/ directory
 *   2. Must have .test.EXT at the end of the filename
 *   3. EXT (above) must be one of js, ts, jsx, or tsx.
 *
 * Note: In order to use a different jest config for e2e tests, this config file
 * must be kept in the bin/ folder to prevent it from being detected as the
 * config file for e2e tests.
 */

// @wordpress/scripts manually adds additional Jest config ontop of
// @wordpress/jest-preset-default so we pull in this file to extend it
const defaults = require( '@wordpress/scripts/config/jest-unit.config.js' );
const path = require( 'path' );

// Basically, CWD, so 'apps/editing-toolkit'.
// Without this, it tries to use 'apps/editing-toolkit/bin'
const pluginRoot = path.resolve( './' );

const config = {
	...defaults,
	rootDir: path.normalize( '../../../' ), // To detect wp-calypso root node_modules
	testMatch: [ `${ pluginRoot }/**/?(*.)test.[jt]s?(x)` ],
	transform: { '^.+\\.[jt]sx?$': path.join( __dirname, 'babel-transform' ) },
	setupFilesAfterEnv: [
		...( defaults.setupFilesAfterEnv || [] ), // extend if present
		'<rootDir>/apps/editing-toolkit/bin/js-unit-setup',
	],
};

module.exports = config;
