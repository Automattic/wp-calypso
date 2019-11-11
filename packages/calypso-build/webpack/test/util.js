const { cssNameFromFilename } = require( '../util' );

describe( 'cssNameFromFilename()', () => {
	test( 'Transforms static string', () => {
		expect( cssNameFromFilename( 'static.js' ) ).toBe( 'static.css' );
	} );

	test( 'Passes `undefined` through', () => {
		expect( cssNameFromFilename() ).toBeUndefined();
	} );

	test( 'Handles templates', () => {
		expect( cssNameFromFilename( '[name].[hash].js' ) ).toBe( '[name].[hash].css' );
	} );

	test( 'Maintains query string', () => {
		expect( cssNameFromFilename( 'static.js?query=string' ) ).toBe( 'static.css?query=string' );
	} );

	test( 'Returns other extensions untouched 😬', () => {
		expect( 'static.jsx' ).toBe( 'static.jsx' );
	} );
} );
