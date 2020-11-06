/**
 * **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

const PACKAGES_DIR = path.join( __dirname, '../../packages' );

const packagesInMonorepo = () =>
	fs
		.readdirSync( PACKAGES_DIR, { withFileTypes: true } )
		.filter( ( file ) => file.isDirectory() )
		.map( ( packageDir ) => require( path.join( PACKAGES_DIR, packageDir.name, 'package.json' ) ) );

module.exports = {
	packagesInMonorepo,
};
