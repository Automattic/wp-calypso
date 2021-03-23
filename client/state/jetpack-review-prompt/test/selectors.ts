/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDismissCount } from '../selectors';

describe( 'selectors', () => {
	describe( 'getDismissCount()', () => {
		test( 'should return zero if no preference saved', () => {
			const state = { preferences: {} };
			expect( getDismissCount( state ) ).to.equal( 0 );
		} );
		test( 'should return count if preference is saved', () => {
			const state = {
				preferences: {
					localValues: {
						'jetpack-review-prompt': {
							dismissCount: 3,
							dismissedAt: null,
							reviewed: false,
						},
					},
				},
			};
			expect( getDismissCount( state ) ).to.equal( 3 );
		} );
	} );
} );
