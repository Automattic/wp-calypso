/**
 * @jest-environment jsdom
 */
import { TYPE_BUSINESS, PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import { useFreeTrialPlanSlugs } from '../use-free-trial-plan-slugs';

describe( 'useFreeTrialPlanSlugs', () => {
	it( 'offers the Business hosting trial for the new-hosted-site intent when eligible', () => {
		const { result } = renderHook( () =>
			useFreeTrialPlanSlugs( {
				intent: 'plans-new-hosted-site',
				eligibleForFreeHostingTrial: true,
			} )
		);

		expect( result.current ).toEqual( { [ TYPE_BUSINESS ]: PLAN_HOSTING_TRIAL_MONTHLY } );
	} );

	it( 'never offers a free hosting trial for the paid-only AI Site Builder intent', () => {
		const { result } = renderHook( () =>
			useFreeTrialPlanSlugs( {
				intent: 'plans-ai-site-builder',
				eligibleForFreeHostingTrial: true,
			} )
		);

		expect( result.current ).toEqual( {} );
	} );
} );
