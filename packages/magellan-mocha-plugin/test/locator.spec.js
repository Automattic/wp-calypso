const Locator = require( '../lib/locator' );

describe( 'locator', function () {
	it( 'should convert to string', function () {
		const a = new Locator( 'a' );
		expect( a.toString() ).toBe( 'a' );
	} );
} );
