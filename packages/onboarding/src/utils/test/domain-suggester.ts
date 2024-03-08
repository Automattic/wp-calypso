import { suggestEmailCorrection } from '../domain-suggester';

describe( 'suggestEmailCorrection', () => {
	test( 'should return correct result and ignores processing for a domain included in valid email domain list', () => {
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

	test( 'should suggest a correction for an invalid email domain within the Levenshtein distance limit of 2', () => {
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

	test( 'should not suggest a correction for an invalid email domain beyond the default Levenshtein distance limit of 2', () => {
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

	test( 'should suggest a correction for a captialized invalid email domain within the Levenshtein distance limit of 2', () => {
		const result = suggestEmailCorrection( 'EXAMPLE@HOTMAAL.COM' );
		expect( result ).toEqual( {
			oldEmail: 'EXAMPLE@HOTMAAL.COM',
			oldDomain: 'hotmaal.com',
			newDomain: 'hotmail.com',
			newEmail: 'example@hotmail.com',
			distance: 1,
			wasCorrected: true,
		} );
	} );

	test( 'should not suggest a correction for a capitalized invalid email domain beyond the default Levenshtein distance limit of 2', () => {
		const result = suggestEmailCorrection( 'EXAMPLE@ZZZZL.COM' );
		expect( result ).toEqual( {
			oldEmail: 'EXAMPLE@ZZZZL.COM',
			oldDomain: 'zzzzl.com',
			newDomain: null,
			newEmail: null,
			distance: Infinity,
			wasCorrected: false,
		} );
	} );

	test( 'should not suggest a correction for a domain included in the domain avoid list', () => {
		const result = suggestEmailCorrection( 'example@mail.com' );
		expect( result ).toEqual( {
			oldEmail: 'example@mail.com',
			oldDomain: 'mail.com',
			newDomain: null,
			newEmail: null,
			distance: Infinity,
			wasCorrected: false,
		} );
	} );

	test( 'should not suggest a correction for a domain if user is still typing', () => {
		const result = suggestEmailCorrection( 'example@gmail.co' );
		expect( result ).toEqual( {
			oldEmail: 'example@gmail.co',
			oldDomain: 'gmail.co',
			newDomain: null,
			newEmail: null,
			distance: Infinity,
			wasCorrected: false,
		} );
	} );
} );
