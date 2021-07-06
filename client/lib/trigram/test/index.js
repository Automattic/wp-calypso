/**
 * Internal dependencies
 */
import { cosineSimilarity, trigrams, gramsToLookup, lookupToMagnitude } from '../';

describe( 'trigram: cosineSimilarity()', () => {
	test( 'Equal Strings should have cosineSimilarity of ~1', () => {
		const str1 = 'This is a string.';
		const str2 = 'This is a string.';
		const sim = cosineSimilarity( str1, str2 );
		expect( sim ).toBeGreaterThan( 0.99 );
		expect( sim ).toBeLessThan( 1.01 );
	} );
	test( 'Completely different strings should have cosineSimilarity of ~0', () => {
		const str1 = 'abcabcabc';
		const str2 = 'xyzxyzxyz';
		const sim = cosineSimilarity( str1, str2 );
		expect( sim ).toBeGreaterThan( -0.01 );
		expect( sim ).toBeLessThan( 0.01 );
	} );
	test( 'Somewhat overlapping strings should have a cosineSimilarity between 0 and 1', () => {
		const str1 = 'There';
		const str2 = 'Their';
		const sim = cosineSimilarity( str1, str2 );
		expect( sim ).toBeGreaterThan( 0.39 );
		expect( sim ).toBeLessThan( 0.41 );
	} );
} );
describe( 'trigram: trigrams()', () => {
	test( 'Generate Trigrams: Hello', () => {
		const result = trigrams( 'Hello' );
		const expected = [ '_BEGIN_He', 'Hel', 'ell', 'llo', 'lo_END_' ];
		expect( result ).toEqual( expected );
	} );
} );
describe( 'trigram: gramsToLookup()', () => {
	test( 'Generate Lookup from precomputed trigrams: mississippi', () => {
		const result = gramsToLookup( [
			'_BEGIN_mi',
			'mis',
			'iss',
			'ssi',
			'sis',
			'iss',
			'ssi',
			'sip',
			'ipp',
			'ppi',
			'pi_END_',
		] );
		const expected = {
			_BEGIN_mi: 1,
			mis: 1,
			iss: 2,
			ssi: 2,
			sis: 1,
			sip: 1,
			ipp: 1,
			ppi: 1,
			pi_END_: 1,
		};
		expect( result ).toEqual( expected );
	} );
} );
describe( 'trigram: integrate: gramsToLookup(trigrams())', () => {
	test( 'Generate trigram and lookup: abecedarian', () => {
		const result = gramsToLookup( trigrams( 'abecedarian' ) );
		const expected = {
			_BEGIN_ab: 1,
			abe: 1,
			bec: 1,
			ece: 1,
			ced: 1,
			eda: 1,
			dar: 1,
			ari: 1,
			ria: 1,
			ian: 1,
			an_END_: 1,
		};
		expect( result ).toEqual( expected );
	} );
} );
describe( 'trigram: lookupToMagnitude', () => {
	test( 'lookupToMagnitude: precomputed lookup: hi', () => {
		const result = lookupToMagnitude( {
			_BEGIN_hi: 1,
			hi_END_: 1,
		} );
		// Look for square root of 2 =~ 1.414213562
		expect( result ).toBeGreaterThan( 1.41 );
		expect( result ).toBeLessThan( 1.42 );
	} );
	test( 'lookupToMagnitude: precomputed lookup: hihihi', () => {
		const result = lookupToMagnitude( {
			_BEGIN_hi: 1,
			hih: 2,
			ihi: 2,
			hi_END_: 1,
		} );
		// 1 + 2^2 + 2^2 + 1 = 10, Look for square root of 10 =~ 3.1622
		expect( result ).toBeGreaterThan( 3.16 );
		expect( result ).toBeLessThan( 3.17 );
	} );
} );
