const fs = require( 'fs' );
const path = require( 'path' );
const api = require.requireActual( './api' );

function test_folder( dir ) {
	const testFiles = fs
		.readdirSync( dir )
		.filter( ( f ) => ! f.endsWith( '.spec.js' ) && f.endsWith( '.js' ) );

	testFiles.forEach( ( filename ) => {
		const filepath = path.join( dir, filename );

		test( filename, () => {
			const result = api.runCodemodDry( path.basename( dir ), filepath );
			expect( result ).toMatchSnapshot();
		} );
	} );
}

global.test_folder = test_folder;
