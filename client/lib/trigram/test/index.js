/**
 * Internal dependencies
 */
import { cosine_similarity, trigrams, grams_to_lookup } from '../';

describe( 'trigram: cosine_similarity()', () => {
	test( 'Equal Strings should have cosine_similarity of ~1', () => {
		const str1 = 'This is a string.';
		const str2 = 'This is a string.';
		const sim = cosine_similarity( str1, str2 );
		expect( sim ).toBeGreaterThan( 0.99 );
		expect( sim ).toBeLessThan( 1.01 );
	} );
	test( 'Completely different strings should have cosine_similarity of ~0', () => {
		const str1 = 'abcabcabc';
		const str2 = 'xyzxyzxyz';
		const sim = cosine_similarity( str1, str2 );
		expect( sim ).toBeGreaterThan( -0.01 );
		expect( sim ).toBeLessThan( 0.01 );
	} );
	test( 'Somewhat overlapping strings should have a cosine_similarity between 0 and 1', () => {
		const str1 = 'There';
		const str2 = 'Their';
		const sim = cosine_similarity( str1, str2 );
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
describe( 'trigram: grams_to_lookup()', () => {
	test( 'Generate Lookup from precomputed trigrams: mississippi', () => {
		const result = grams_to_lookup( [
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
describe( 'trigram: integrate: grams_to_lookup(trigrams())', () => {
	test( 'Generate trigram and lookup: abecedarian', () => {
		const result = grams_to_lookup( trigrams( 'abecedarian' ) );
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
