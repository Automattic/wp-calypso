/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { slugify } from '../actions';

describe( 'actions', () => {
	describe( '#slugify()', () => {
		it( 'numbers dont get separated by hyphen', () => {
			const tag = 'a8cday';
			const slug = 'a8cday';

			expect( slugify( tag ) ).to.eql( slug );
		} );

		it( 'unicode becomes encoded', () => {
			const tag = '∑';
			const slug = '%E2%88%91';

			expect( slugify( tag ) ).to.eql( slug );
		} );

		it( 'Multi word becomes hyphenated', () => {
			const tag = 'Chickens Love Poke';
			const slug = 'chickens-love-poke';

			expect( slugify( tag ) ).to.eql( slug );
		} );

		it( 'emoji becomes encoded', () => {
			const tag = '🐬';
			const slug = '%F0%9F%90%AC';

			expect( slugify( tag ) ).to.eql( slug );
		} );

		it( 'single lowercase word remains unchanged', () => {
			const tag = 'word';
			const slug = 'word';

			expect( slugify( tag ) ).to.eql( slug );
		} );

		it( 'camel cased word goes lowercase', () => {
			const tag = 'wordWithCamels';
			const slug = 'wordwithcamels';

			expect( slugify( tag ) ).to.eql( slug );
		} );
	} );
} );
