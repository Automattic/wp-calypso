/** @format */

/**
 * Internal dependencies
 */
import { siteHasBusinessPlan } from '../is-site-google-my-business-eligible';

import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';
import selectors from 'state/sites/selectors';

jest.mock( 'state/sites/selectors', () => ( {
	getSitePlanSlug: jest.fn(),
} ) );

describe( 'siteHasBusinessPlan()', () => {
	test( 'should return true if site has WP.com business plan', () => {
		const plans = [ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ];

		plans.forEach( plan => {
			selectors.getSitePlanSlug.mockImplementation( () => plan );

			expect( siteHasBusinessPlan() ).toBe( true );
		} );
	} );

	test( 'should return false if site does not have a WP.com business plan', () => {
		const plans = [
			PLAN_FREE,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		];

		plans.forEach( plan => {
			selectors.getSitePlanSlug.mockImplementation( () => plan );

			expect( siteHasBusinessPlan() ).toBe( false );
		} );
	} );
} );
