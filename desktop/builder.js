/**
 * External Dependencies
 */
var packager = require( 'electron-packager' );
var fs = require( 'fs' );
var path = require( 'path' );

/**
 * Internal dependencies
 */
var builder = require( './resource/lib/tools' );
var config = require( './resource/lib/config' );
var pkg = require( '../package.json' );

/**
 * Module variables
 */
var electronVersion = pkg.devDependencies.electron;

var opts = {
	dir: './build',
	name: config.name,
	author: config.author,
	platform: builder.getPlatform( process.argv ),
	arch: builder.getArch( process.argv ),
	version: electronVersion,
	appVersion: config.version,
	appSign: 'Developer ID Application: ' + config.author,
	out: './release',
	icon: builder.getIconFile( process.argv ),
	'app-bundle-id': config.bundleId,
	'helper-bundle-id': config.bundleId,
	'app-category-type': 'public.app-category.social-networking',
	'app-version': config.version,
	'build-version': config.version,
	overwrite: true,
	ignore: [ 'desktop-test.js' ],
	asar: false,
	prune: true,
	sign: false,
	'version-string': {
		CompanyName: config.author,
		LegalCopyright: config.copyright,
		ProductName: config.name,
		InternalName: config.name,
		FileDescription: config.name,
		OriginalFilename: config.name,
		FileVersion: config.version,
		ProductVersion: config.version
	}
};

builder.beforeBuild( __dirname, opts, function( error ) {
	if ( error ) {
		throw error;
	}

	packager( opts, function( err ) {
		if ( err ) {
			console.log( error );
		} else {
			builder.cleanUp( path.join( __dirname, 'release' ), opts );
		}
	} );
} )
