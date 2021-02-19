/**
 * Internal dependencies
 */
import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PREMIUM,
} from 'calypso/lib/plans/constants';
import isEligibleForUpworkSupport, {
	UPWORK_LOCALES,
} from 'calypso/state/selectors/is-eligible-for-upwork-support';

describe( 'isEligibleForUpworkSupport()', () => {
	test( 'returns false for `en` users and all sites have a free plan', () => {
		const state = {
			currentUser: { id: 1, user: { ID: 1, localeSlug: 'en' } },
			sites: {
				items: {
					111: { plan: { product_slug: PLAN_FREE } },
					222: { plan: { product_slug: PLAN_PREMIUM } },
				},
			},
		};
		expect( isEligibleForUpworkSupport( state ) ).toBe( false );
	} );

	/**
	 * If any plan listed below in user's account then not eligible
	 * for upwork support.
	 */
	const nonUpworkPlans = [ PLAN_BUSINESS, PLAN_ECOMMERCE ];

	describe.each( UPWORK_LOCALES )( 'when locale %s', ( localeSlug ) => {
		test( 'returns true for users without Business and E-Commerce plans', () => {
			const state = {
				currentUser: { id: 1, user: { localeSlug } },
				sites: {
					items: {
						111: { plan: { product_slug: PLAN_FREE } },
						222: { plan: { product_slug: PLAN_PREMIUM } },
					},
				},
			};
			expect( isEligibleForUpworkSupport( state ) ).toBe( true );
		} );

		describe.each( nonUpworkPlans )( 'with plan %s', ( product_slug ) => {
			test( 'returns false', () => {
				const state = {
					currentUser: { id: 1, user: { localeSlug } },
					sites: {
						items: {
							333: { plan: { product_slug } },
						},
					},
				};
				expect( isEligibleForUpworkSupport( state ) ).toBe( false );
			} );
		} );
	} );
} );
