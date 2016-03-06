#!/usr/bin/env node
require( 'babel/register' );

const program = require( 'commander' ),
	Mocha = require( 'mocha' ),
	Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	nock = require( 'nock' ),
	path = require( 'path' );

program
	.usage( '[options] [files]' )
	.option( '-R, --reporter <name>', 'specify the reporter to use', 'spec' );

program.name = 'runner';

program.parse( process.argv );

const mocha = new Mocha( {
	ui: 'bdd',
	reporter: program.reporter
} );

mocha.suite.beforeAll( function() {
	Chai.use( sinonChai );
	nock.disableNetConnect();
} );

mocha.suite.afterAll( function() {
	nock.cleanAll();
	nock.enableNetConnect();
	nock.restore();
} );

// we could also discover all the tests using a glob?
if ( program.args.length ) {
	program.args.forEach( function( file ) {
		mocha.addFile( file );
	} );
} else {
	mocha.addFile( path.join( __dirname, 'load-suite.js' ) );
}

mocha.run( function( failures ) {
	process.on( 'exit', function() {
		process.exit( failures ); //eslint-disable-line no-process-exit
	} );
} );
