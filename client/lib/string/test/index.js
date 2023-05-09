import { areEqualIgnoringWhitespaceAndCase } from '../';

describe( 'lib/string/areEqualIgnoringWhitespaceAndCase', () => {
	test( 'should match', () => {
		const pairs = [
			// actual, expected
			[ null, null ],
			[ '', '' ],
			[ 'hi there', 'Hi There' ],
			[ 'hithere', 'Hi There' ],
			[ 'hi-there', 'Hi There.' ],
			[ 'hi_there', 'Hi THERE' ],
		];
		pairs.forEach( ( pair ) => {
			expect( areEqualIgnoringWhitespaceAndCase( pair[ 0 ], pair[ 1 ] ) ).toBe( true );
		} );
	} );
} );
