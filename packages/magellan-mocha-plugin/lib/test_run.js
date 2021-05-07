//
// Provide Mocha support for:
//   - Non-browser testing, or regular node.js mocha tests
//

const _ = require( 'lodash' );
const mochaSettings = require( './settings' );
const path = require( 'path' );
const fs = require( 'fs' );

const testCounter = {};

const MochaTestRun = function ( options ) {
	// Share assets directory with mocha tests
	const testName = options.locator.name;
	const sanitizedName = testName
		.replace( /[^a-z0-9]/gi, '-' )
		.replace( /-+/g, '-' )
		.replace( /^-|-$/, '' )
		.toLowerCase();
	testCounter[ options.locator.name ] = ( testCounter[ options.locator.name ] ?? 0 ) + 1;
	const assetsDir = sanitizedName + '-' + testCounter[ options.locator.name ];
	process.env.TEMP_ASSET_PATH = path.join( options.tempAssetPath, '..', assetsDir );
	fs.mkdirSync( process.env.TEMP_ASSET_PATH, { recursive: true } );
	_.extend( this, options );
};

// return the command line path to the test framework binary
MochaTestRun.prototype.getCommand = function () {
	return './node_modules/.bin/mocha';
};

// return the environment
MochaTestRun.prototype.getEnvironment = function ( env ) {
	return _.extend( {}, env );
};

MochaTestRun.prototype.getArguments = function () {
	let grepString = this.locator.name;

	const escapees = '\\^$[]+*.()"';
	escapees.split( '' ).forEach( function ( ch ) {
		grepString = grepString.split( ch ).join( '\\' + ch );
	} );

	let args = [ '--bail', '--mocking_port=' + this.mockingPort, '--worker=1', '-g', grepString ];

	if ( mochaSettings.mochaConfig ) {
		args.push( '--config', mochaSettings.mochaConfig );
	}

	if ( mochaSettings.mochaArgs !== undefined ) {
		args = args.concat( mochaSettings.mochaArgs.split( ' ' ) );
	}

	args = args.concat( mochaSettings.mochaTestFolders );

	return args;
};

module.exports = MochaTestRun;
