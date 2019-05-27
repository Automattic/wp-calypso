/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_FREE, PLAN_PREMIUM } from 'lib/plans/constants';
import isEligibleForUpworkSupport from 'state/selectors/is-eligible-for-upwork-support';

describe( 'isEligibleForUpworkSupport()', () => {
	test( 'returns true for Spanish language users without Business and E-Commerce plans', () => {
		const state = {
			currentUser: { id: 1 },
			sites: {
				items: {
					111: { plan: { product_slug: PLAN_FREE } },
					222: { plan: { product_slug: PLAN_PREMIUM } },
				},
			},
			users: { items: { 1: { localeSlug: 'es' } } },
		};
		expect( isEligibleForUpworkSupport( state ) ).to.be.true;
	} );

	test( 'returns false for Spanish language users with Business plans', () => {
		const state = {
			currentUser: { id: 1 },
			sites: {
				items: {
					333: { plan: { product_slug: PLAN_BUSINESS } },
				},
			},
			users: { items: { 1: { localeSlug: 'es' } } },
		};
		expect( isEligibleForUpworkSupport( state ) ).to.be.false;
	} );

	test( 'returns false for Spanish language users with E-Commerce plans', () => {
		const state = {
			currentUser: { id: 1 },
			sites: {
				items: {
					444: { plan: { product_slug: PLAN_ECOMMERCE } },
				},
			},
			users: { items: { 1: { localeSlug: 'es' } } },
		};
		expect( isEligibleForUpworkSupport( state ) ).to.be.false;
	} );

	test( 'returns false for non-Spanish language users false if all sites have a free plan', () => {
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

	test( 'returns true for French language users without Business and E-Commerce plans', () => {
		const state = {
			currentUser: { id: 1 },
			sites: {
				items: {
					111: { plan: { product_slug: PLAN_FREE } },
					222: { plan: { product_slug: PLAN_PREMIUM } },
				},
			},
			users: { items: { 1: { localeSlug: 'fr' } } },
		};
		expect( isEligibleForUpworkSupport( state ) ).to.be.true;
	} );

	test( 'returns true for Portugese language users without Business and E-Commerce plans', () => {
		const state = {
			currentUser: { id: 1 },
			sites: {
				items: {
					111: { plan: { product_slug: PLAN_FREE } },
					222: { plan: { product_slug: PLAN_PREMIUM } },
				},
			},
			users: { items: { 1: { localeSlug: 'pt' } } },
		};
		expect( isEligibleForUpworkSupport( state ) ).to.be.true;
	} );
} );
