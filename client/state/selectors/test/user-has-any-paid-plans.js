/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, PLAN_FREE } from 'calypso/lib/plans/constants';
import userHasAnyPaidPlans from 'calypso/state/selectors/user-has-any-paid-plans';

describe( 'userHasAnyPaidPlans()', () => {
	test( 'should return false if no sites in state', () => {
		const state = {
			sites: {
				items: {},
			},
		};

		const hasPlan = userHasAnyPaidPlans( state );
		expect( hasPlan ).to.be.false;
	} );

	test( 'should return false if all sites have a free plan', () => {
		const state = {
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						plan: { product_slug: 'free_plan' },
					},
				},
			},
		};

		const hasPlan = userHasAnyPaidPlans( state );
		expect( hasPlan ).to.be.false;
	} );

	test( 'should return true if at least one site has a paid plan', () => {
		const state = {
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						plan: { product_slug: PLAN_FREE },
					},
					1234567: {
						ID: 1234567,
						name: 'WordPress.com Example Blog',
						plan: { product_slug: PLAN_BUSINESS },
					},
				},
			},
		};

		const hasPlan = userHasAnyPaidPlans( state );
		expect( hasPlan ).to.be.true;
	} );
} );
