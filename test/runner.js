#!/usr/bin/env node
require( 'babel/register' );

const program = require( 'commander' ),
	Mocha = require( 'mocha' ),
	path = require( 'path' ),
	boot = require( './boot-test' ),
	setup = require( './setup' );

program
	.usage( '[options] [files]' )
	.option( '-R, --reporter <name>', 'specify the reporter to use', 'spec' )
	.option( '-g, --grep <pattern>', 'only run tests matching <pattern>' )
	.option( '-w, --whitelist', 'only run whitelisted tests when using a glob' );

program.name = 'runner';

program.parse( process.argv );

const mocha = new Mocha( {
	ui: 'bdd',
	reporter: program.reporter
} );

if ( program.grep ) {
	mocha.grep( new RegExp( program.grep ) );
}

if ( program.whitelist ) {
	setup.enableWhitelist();
}

mocha.suite.beforeAll( boot.before );
mocha.suite.afterAll( boot.after );

// we could also discover all the tests using a glob?
if ( program.args.length ) {
	program.args.forEach( function( file ) {
		setup.addFile( file );
	} );
}

mocha.addFile( path.join( __dirname, 'load-suite.js' ) );

mocha.run( function( failures ) {
	process.on( 'exit', function() {
		process.exit( failures ); //eslint-disable-line no-process-exit
	} );
} );
