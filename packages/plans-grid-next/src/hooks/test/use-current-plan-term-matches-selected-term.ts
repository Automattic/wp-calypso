/**
 * @jest-environment jsdom
 */

import { Plans } from '@automattic/data-stores';
import { renderHook } from '@testing-library/react';
import { useCurrentPlanTermMatchesSelectedTerm } from '../use-current-plan-term-matches-selected-term';

jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );

describe( 'useCurrentPlanTermMatchesSelectedTerm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should return true when the current plan billing term matches the selected billing term', () => {
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			value_bundle: {
				billingPeriod: 365, // Yearly plan
			},
		} );

		const { result } = renderHook( () =>
			useCurrentPlanTermMatchesSelectedTerm( {
				currentSitePlanSlug: 'value_bundle',
				intervalType: 'yearly', // Maps to 365 days
				siteId: 123,
				useCheckPlanAvailabilityForPurchase: jest.fn(),
			} )
		);

		expect( result.current ).toBe( true );
	} );

	it( 'should return false when current plan billing term does not match the selected billing term', () => {
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			value_bundle: {
				billingPeriod: 365, // Yearly plan
			},
		} );

		const { result } = renderHook( () =>
			useCurrentPlanTermMatchesSelectedTerm( {
				currentSitePlanSlug: 'value_bundle',
				intervalType: 'monthly', // Maps to 30 days, not 365
				siteId: 123,
				useCheckPlanAvailabilityForPurchase: jest.fn(),
			} )
		);

		expect( result.current ).toBe( false );
	} );

	it( 'should return false when there is no current plan', () => {
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			value_bundle: {
				billingPeriod: 365, // Yearly plan
			},
		} );

		const { result } = renderHook( () =>
			useCurrentPlanTermMatchesSelectedTerm( {
				currentSitePlanSlug: undefined, // No current plan
				intervalType: 'yearly',
				siteId: 123,
				useCheckPlanAvailabilityForPurchase: jest.fn(),
			} )
		);

		expect( result.current ).toBe( false );
	} );
} );
