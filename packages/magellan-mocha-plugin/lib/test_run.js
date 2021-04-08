/* eslint no-invalid-this: 0, no-irregular-whitespace: 0, global-require: 0 */
'use strict';

//
// Provide Mocha support for:
//   - Non-browser testing, or regular node.js mocha tests
//

var _ = require( 'lodash' );
var mochaSettings = require( './settings' );

var MochaTestRun = function ( options ) {
	// Share assets directory with mocha tests
	process.env.TEMP_ASSET_PATH = options.tempAssetPath;

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
	var grepString = this.locator.name;

	var escapees = '\\^$[]+*.()"';
	escapees.split( '' ).forEach( function ( ch ) {
		grepString = grepString.split( ch ).join( '\\' + ch );
	} );

	var args = [ '--mocking_port=' + this.mockingPort, '--worker=1', '-g', grepString ];

	if ( mochaSettings.mochaOpts ) {
		args.push( '--opts', mochaSettings.mochaOpts );
	}

	if ( mochaSettings.mochaArgs !== undefined ) {
		args = args.concat( mochaSettings.mochaArgs.split( ' ' ) );
	}

	args = args.concat( mochaSettings.mochaTestFolders );

	return args;
};

module.exports = MochaTestRun;
