#!/usr/bin/env node
var files;

require( 'babel/register' );

/**
 * External dependencies
 */
const glob = require( 'glob' ),
	Mocha = require( 'mocha' ),
	path = require( 'path' ),
	program = require( 'commander' );

/**
 * Internal dependencies
 */
const boot = require( './boot-test' ),
	setup = require( './setup' );

program
	.usage( '[options] [files]' )
	.option( '-R, --reporter <name>', 'specify the reporter to use', 'spec' )
	.option( '-g, --grep <pattern>', 'only run tests matching <pattern>' );

program.name = 'runner';

program.parse( process.argv );

const mocha = new Mocha( {
	ui: 'bdd',
	reporter: program.reporter
} );

if ( program.grep ) {
	mocha.grep( new RegExp( program.grep ) );
}

mocha.suite.beforeAll( boot.before );
mocha.suite.afterAll( boot.after );

files = program.args;
if ( files.length === 0 ) {
	files = glob.sync( process.env.TEST_ROOT + '/**/test/*.@(js|jsx)' );
}
files.forEach( setup.addFile );

mocha.addFile( path.join( __dirname, 'load-suite.js' ) );

mocha.run( function( failures ) {
	process.on( 'exit', function() {
		process.exit( failures ); //eslint-disable-line no-process-exit
	} );
} );
