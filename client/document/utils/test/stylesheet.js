/**
 * @format
 */

describe( 'getStylesheet', () => {
	let getStylesheet;

	beforeAll( () => {
		getStylesheet = require( '../stylesheet' );
	} );

	test( 'should return "style.css"', () => {
		expect( getStylesheet() ).toEqual( 'style.css' );
	} );

	test( 'should return "style-rtl.css"', () => {
		const options = {
			rtl: true,
			debug: false,
		};

		expect( getStylesheet( options ) ).toEqual( 'style-rtl.css' );
	} );

	test( 'should return "style-debug.css"', () => {
		const options = {
			rtl: false,
			debug: true,
			env: 'production',
		};

		expect( getStylesheet( options ) ).toEqual( 'style-debug.css' );
	} );

	test( 'should return "style-debug-rtl.css"', () => {
		const options = {
			rtl: true,
			debug: true,
		};

		expect( getStylesheet( options ) ).toEqual( 'style-debug-rtl.css' );
	} );
} );
