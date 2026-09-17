import capitalize from '../capitalize';

describe( 'capitalize', () => {
	it( 'upper-cases the first character and lower-cases the rest', () => {
		expect( capitalize( 'fred' ) ).toBe( 'Fred' );
		expect( capitalize( 'FRED' ) ).toBe( 'Fred' );
		expect( capitalize( 'fred flintstone' ) ).toBe( 'Fred flintstone' );
		expect( capitalize( 'FRED FLINTSTONE' ) ).toBe( 'Fred flintstone' );
		expect( capitalize( 'WordPress' ) ).toBe( 'Wordpress' );
	} );

	it( 'handles single characters and leading non-letters', () => {
		expect( capitalize( 'a' ) ).toBe( 'A' );
		expect( capitalize( 'A' ) ).toBe( 'A' );
		expect( capitalize( '123abc' ) ).toBe( '123abc' );
	} );

	it( 'returns an empty string for empty or nullish input', () => {
		expect( capitalize( '' ) ).toBe( '' );
		expect( capitalize( undefined ) ).toBe( '' );
		expect( capitalize( null ) ).toBe( '' );
	} );

	it( 'works on full Unicode code points', () => {
		expect( capitalize( 'éclair' ) ).toBe( 'Éclair' );
		expect( capitalize( 'ÉCLAIR' ) ).toBe( 'Éclair' );
		expect( capitalize( '😀abc' ) ).toBe( '😀abc' );
	} );
} );
