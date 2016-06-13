/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_START_RECOMMENDATIONS_RECEIVE
} from 'state/action-types';
import {
	items
} from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty array', () => {
			const state = items( undefined, [] );
			expect( state ).to.eql( [] );
		} );

		it( 'should not accept duplicate recommendations', () => {
			const original = [ { ID: 123 }, { ID: 456 } ];
			const state = items( original, {
				type: READER_START_RECOMMENDATIONS_RECEIVE,
				recommendations: [ { ID: 123 }, { ID: 413 } ]
			} );
			// Second ID: 123 recommendation should have been discarded
			const expected = [ { ID: 123 }, { ID: 456 }, { ID: 413 } ];
			expect( state ).to.eql( expected );
		} );

		it( 'should insert a new recommendation', () => {
			const original = [
				{
					ID: 123,
					recommended_site_ID: 99,
					recommended_post_ID: 444
				},
				{
					ID: 456,
					recommended_site_ID: 99,
					recommended_post_ID: 445
				}
			];
			const newRecommendation = {
				ID: 567,
				origin_site_ID: 99,
				origin_post_ID: 445
			};
			const state = items( original, {
				type: READER_START_RECOMMENDATIONS_RECEIVE,
				recommendations: [ newRecommendation ]
			} );
			expect( state[2] ).to.eql( newRecommendation );
		} );
	} );
} );
