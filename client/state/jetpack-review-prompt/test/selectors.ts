/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDismissCount, getIsDismissed } from '../selectors';
import { TIME_BETWEEN_PROMPTS } from '../constants';

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

	describe( 'getIsDismissed()', () => {
		test( 'should return false if no preference saved', () => {
			const state = { preferences: {} };
			expect( getIsDismissed( state ) ).to.be.false;
		} );
		test( 'should return true if reviewed', () => {
			const state = {
				preferences: {
					localValues: {
						'jetpack-review-prompt': {
							dismissCount: 1,
							dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
							reviewed: true,
						},
					},
				},
			};
			expect( getIsDismissed( state ) ).to.be.true;
		} );
		test( 'should return false if dismissed just now', () => {
			const state = {
				preferences: {
					localValues: {
						'jetpack-review-prompt': {
							dismissCount: 1,
							dismissedAt: Date.now(),
							reviewed: false,
						},
					},
				},
			};
			expect( getIsDismissed( state ) ).to.be.true;
		} );
		test( 'should return true if dismissed longer than TIME_BETWEEN_PROMPTS', () => {
			const state = {
				preferences: {
					localValues: {
						'jetpack-review-prompt': {
							dismissCount: 1,
							dismissedAt: Date.now() - ( TIME_BETWEEN_PROMPTS + 1 ),
							reviewed: false,
						},
					},
				},
			};
			expect( getIsDismissed( state ) ).to.be.false;
		} );
		test( 'should return true if dismissed twice', () => {
			const state = {
				preferences: {
					localValues: {
						'jetpack-review-prompt': {
							dismissCount: 2,
							dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
							reviewed: false,
						},
					},
				},
			};
			expect( getIsDismissed( state ) ).to.be.true;
		} );
	} );
} );
