/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */

// import { getIsDismissed, getIsValid } from '../selectors';
// import { TIME_BETWEEN_PROMPTS } from '../constants';
import { combineDismissPreference, combineValidPreference } from '../actions';

describe( 'actions', () => {
	describe( 'combineDismissPreference()', () => {
		test( 'should set dismissedAt', () => {
			const dismissDate = Date.now();

			expect(
				combineDismissPreference( { preferences: {} }, 'scan', dismissDate, false ).scan
			).to.have.property( 'dismissedAt', dismissDate );
		} );

		test( 'should set dismissCount to 1 on initial dismiss', () => {
			expect(
				combineDismissPreference( { preferences: {} }, 'scan', Date.now(), false ).scan
			).to.have.property( 'dismissCount', 1 );
		} );

		test( 'should increment dismissCount', () => {
			expect(
				combineDismissPreference(
					{
						preferences: {
							localValues: {
								'jetpack-review-prompt': {
									scan: {
										dismissCount: 1,
										dismissedAt: Date.now(),
										validFrom: null,
										reviewed: false,
									},
								},
							},
						},
					},
					'scan',
					Date.now(),
					false
				).scan
			).to.have.property( 'dismissCount', 2 );
		} );

		test( 'should set reviewed', () => {
			expect(
				combineDismissPreference(
					{
						preferences: {},
					},
					'scan',
					Date.now(),
					true
				).scan
			).to.have.property( 'reviewed', true );
		} );

		describe( 'combineDismissPreference()', () => {
			test( 'should set validFrom', () => {
				const validFrom = Date.now();

				expect(
					combineValidPreference( { preferences: {} }, 'scan', validFrom ).scan
				).to.have.property( 'validFrom', validFrom );
			} );
		} );
	} );
} );
