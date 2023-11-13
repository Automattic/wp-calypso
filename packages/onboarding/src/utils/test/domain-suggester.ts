import { suggestEmailCorrection } from '../domain-suggester';

describe( 'suggestEmailCorrection', () => {
	test( 'returns correct result and ignores processing for a domain included in valid email domain list', () => {
		const result = suggestEmailCorrection( 'example@gmail.com' );
		expect( result ).toEqual( {
			oldEmail: 'example@gmail.com',
			oldDomain: 'gmail.com',
			newDomain: null,
			newEmail: null,
			distance: Infinity,
			wasCorrected: false,
		} );
	} );

	test( 'suggests a correction for an invalid email domain within the Levenshtein distance limit of 2', () => {
		const result = suggestEmailCorrection( 'example@gnail.com' );
		expect( result ).toEqual( {
			oldEmail: 'example@gnail.com',
			oldDomain: 'gnail.com',
			newDomain: 'gmail.com',
			newEmail: 'example@gmail.com',
			distance: 1,
			wasCorrected: true,
		} );
	} );

	test( 'does not suggest a correction for an invalid email domain beyond the default Levenshtein distance limit of 2', () => {
		const result = suggestEmailCorrection( 'example@ggggl.com' );
		expect( result ).toEqual( {
			oldEmail: 'example@ggggl.com',
			oldDomain: 'ggggl.com',
			newDomain: null,
			newEmail: null,
			distance: Infinity,
			wasCorrected: false,
		} );
	} );

	// Add more test cases as needed
} );
