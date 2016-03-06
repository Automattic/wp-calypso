require( 'babel/register' );

const Mocha = require( 'mocha' ),
	glob = require( 'glob' ),
	Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	nock = require( 'nock' );

const mocha = new Mocha( {
	ui: 'bdd',
	reporter: 'spec'
} );

const tests = process.argv.length > 2
	? process.argv.slice( 2 )
	: glob.sync( '**/test/index.js', {} );

mocha.suite.beforeAll( function() {
	Chai.use( sinonChai );
	nock.disableNetConnect();
} );

mocha.suite.afterAll( function() {
	nock.cleanAll();
	nock.enableNetConnect();
	nock.restore();
} );

tests.forEach( function( file ) {
	mocha.addFile( file );
} );

mocha.run( function( failures ) {
	process.on( 'exit', function() {
		process.exit( failures ); //eslint-disable-line no-process-exit
	} );
} );
