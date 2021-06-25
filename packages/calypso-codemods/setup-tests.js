const fs = require( 'fs' );
const path = require( 'path' );
const api = jest.requireActual( './api' );

function test_folder( dir ) {
	const testFiles = fs
		.readdirSync( dir )
		.filter( ( f ) => ! f.endsWith( '.spec.js' ) && f.endsWith( '.js' ) );

	test.each( testFiles )( '%s', ( filename ) => {
		const filepath = path.join( dir, filename );
		const result = api.runCodemodDry( path.basename( dir ), filepath );
		expect( result ).toMatchSnapshot();
	} );
}

global.test_folder = test_folder;
