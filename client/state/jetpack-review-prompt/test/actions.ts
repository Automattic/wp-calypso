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

const TEST_SITE_ID = 123456789;

describe( 'actions', () => {
	describe( 'Scan Review Prompt:', () => {
		describe( 'combineDismissPreference()', () => {
			test( 'should set dismissedAt', () => {
				const dismissDate = Date.now();

				expect(
					combineDismissPreference(
						{
							ui: {
								selectedSiteId: TEST_SITE_ID,
							},
							preferences: {},
						},
						'scan',
						dismissDate,
						false
					).scan[ TEST_SITE_ID ]
				).to.have.property( 'dismissedAt', dismissDate );
			} );

			test( 'should set dismissCount to 1 on initial dismiss', () => {
				expect(
					combineDismissPreference(
						{
							ui: {
								selectedSiteId: TEST_SITE_ID,
							},
							preferences: {},
						},
						'scan',
						Date.now(),
						false
					).scan[ TEST_SITE_ID ]
				).to.have.property( 'dismissCount', 1 );
			} );

			test( 'should increment dismissCount', () => {
				expect(
					combineDismissPreference(
						{
							ui: {
								selectedSiteId: TEST_SITE_ID,
							},
							preferences: {
								localValues: {
									'jetpack-review-prompt': {
										scan: {
											[ TEST_SITE_ID ]: {
												dismissCount: 1,
												dismissedAt: Date.now(),
												validFrom: null,
												reviewed: false,
											},
										},
									},
								},
							},
						},
						'scan',
						Date.now(),
						false
					).scan[ TEST_SITE_ID ]
				).to.have.property( 'dismissCount', 2 );
			} );

			test( 'should set reviewed', () => {
				expect(
					combineDismissPreference(
						{
							ui: {
								selectedSiteId: TEST_SITE_ID,
							},
							preferences: {},
						},
						'scan',
						Date.now(),
						true
					).scan[ TEST_SITE_ID ]
				).to.have.property( 'reviewed', true );
			} );

			describe( 'combineValidPreference()', () => {
				test( 'should set validFrom', () => {
					const validFrom = Date.now();

					expect(
						combineValidPreference(
							{
								ui: {
									selectedSiteId: TEST_SITE_ID,
								},
								preferences: {},
							},
							'scan',
							validFrom
						).scan[ TEST_SITE_ID ]
					).to.have.property( 'validFrom', validFrom );
				} );
			} );
		} );
	} );
	describe( 'Restore Review Prompt:', () => {
		describe( 'combineDismissPreference()', () => {
			test( 'should set dismissedAt', () => {
				const dismissDate = Date.now();

				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'restore',
						dismissDate,
						false
					).restore
				).to.have.property( 'dismissedAt', dismissDate );
			} );

			test( 'should set dismissCount to 1 on initial dismiss', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'restore',
						Date.now(),
						false
					).restore
				).to.have.property( 'dismissCount', 1 );
			} );

			test( 'should increment dismissCount', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {
								localValues: {
									'jetpack-review-prompt': {
										restore: {
											dismissCount: 1,
											dismissedAt: Date.now(),
											validFrom: null,
											reviewed: false,
										},
									},
								},
							},
						},
						'restore',
						Date.now(),
						false
					).restore
				).to.have.property( 'dismissCount', 2 );
			} );

			test( 'should set reviewed', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'restore',
						Date.now(),
						true
					).restore
				).to.have.property( 'reviewed', true );
			} );
		} );

		describe( 'combineValidPreference()', () => {
			test( 'should set validFrom', () => {
				const validFrom = Date.now();

				expect(
					combineValidPreference(
						{
							preferences: {},
						},
						'restore',
						validFrom
					).restore
				).to.have.property( 'validFrom', validFrom );
			} );
		} );
	} );
} );
