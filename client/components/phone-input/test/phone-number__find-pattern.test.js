import { countries } from '../data';
import { findPattern } from '../phone-number';

describe( 'findPattern( number, patterns )', () => {
	test( 'Pattern is found', function () {
		const pattern = findPattern( '4259999999', countries.US.patterns );
		expect( pattern ).toBeTruthy();
	} );
} );
