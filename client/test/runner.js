require( 'babel/register' );

const Mocha = require( 'mocha' ),
	Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	nock = require( 'nock' ),
	path = require( 'path' );

const mocha = new Mocha( {
	ui: 'bdd',
	reporter: 'spec'
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
if ( process.argv.length > 2 ) {
	process.argv.slice( 2 ).forEach( function( file ) {
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
