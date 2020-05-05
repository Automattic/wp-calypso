/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_FREE, PLAN_PREMIUM } from 'lib/plans/constants';
import isEligibleForUpworkSupport, {
	UPWORK_LOCALES,
} from 'state/selectors/is-eligible-for-upwork-support';

describe( 'isEligibleForUpworkSupport()', () => {
	test( 'returns false for `en` users and all sites have a free plan', () => {
		const state = {
			currentUser: { id: 1 },
			sites: {
				items: {
					111: { plan: { product_slug: PLAN_FREE } },
					222: { plan: { product_slug: PLAN_PREMIUM } },
				},
			},
			users: { items: { 1: { localeSlug: 'en' } } },
		};
		expect( isEligibleForUpworkSupport( state ) ).to.be.false;
	} );

	/**
	 * If any plan listed below in user's account then not eligible
	 * for upwork support.
	 */
	const nonUpworkPlans = [ PLAN_BUSINESS, PLAN_ECOMMERCE ];

	describe.each( UPWORK_LOCALES )( 'when locale %s', ( localeSlug ) => {
		test( 'returns true for users without Business and E-Commerce plans', () => {
			const state = {
				currentUser: { id: 1 },
				sites: {
					items: {
						111: { plan: { product_slug: PLAN_FREE } },
						222: { plan: { product_slug: PLAN_PREMIUM } },
					},
				},
				users: { items: { 1: { localeSlug } } },
			};
			expect( isEligibleForUpworkSupport( state ) ).to.be.true;
		} );

		describe.each( nonUpworkPlans )( 'with plan %s', ( product_slug ) => {
			test( 'returns false', () => {
				const state = {
					currentUser: { id: 1 },
					sites: {
						items: {
							333: { plan: { product_slug } },
						},
					},
					users: { items: { 1: { localeSlug } } },
				};
				expect( isEligibleForUpworkSupport( state ) ).to.be.false;
			} );
		} );
	} );
} );
