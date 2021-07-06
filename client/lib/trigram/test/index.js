/**
 * Internal dependencies
 */
import { cosine_similarity } from '../';

describe( 'trigram', () => {
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
