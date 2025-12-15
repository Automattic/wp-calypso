/**
 * @jest-environment jsdom
 */

import { SitePlan, useSitePlans } from '@automattic/data-stores/src/plans';
import { COST_OVERRIDE_REASONS } from '@automattic/data-stores/src/plans/constants';
import { UseQueryResult } from '@tanstack/react-query';
import { useMaxPlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits';
import { useProrationUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-proration-upgrade-credits-applicable';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores/src/plans/queries/use-site-plans', () => jest.fn() );

const siteId = 1;

describe( 'useProrationUpgradeCreditsApplicable', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		jest
			.mocked( useSitePlans )
			.mockReturnValue( { data: {} } as UseQueryResult< { free_plan: SitePlan } > );
	} );

	test( 'Returns null when there are no proration overrides', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		jest.mocked( useSitePlans ).mockReturnValue( {
			data: {
				free_plan: { pricing: { costOverrides: [ { overrideCode: 'some-other-override' } ] } },
			},
		} as UseQueryResult< { free_plan: SitePlan } > );

		const { result } = renderHookWithProvider( () =>
			useProrationUpgradeCreditsApplicable( siteId )
		);
		expect( result.current ).toBeNull();
	} );

	test( 'Returns credits + domain flag when RECENT_DOMAIN_PRORATION exists', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		jest.mocked( useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [ { overrideCode: COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION } ],
					},
				},
			},
		} as UseQueryResult< { free_plan: SitePlan } > );

		const { result } = renderHookWithProvider( () =>
			useProrationUpgradeCreditsApplicable( siteId )
		);
		expect( result.current ).toEqual( {
			credits: 1000,
			hasDomainProration: true,
			hasOtherUpgradeProration: false,
		} );
	} );

	test( 'Returns credits + other flag when RECENT_PLAN_PRORATION exists', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 500 );
		jest.mocked( useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [ { overrideCode: COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION } ],
					},
				},
			},
		} as UseQueryResult< { free_plan: SitePlan } > );

		const { result } = renderHookWithProvider( () =>
			useProrationUpgradeCreditsApplicable( siteId )
		);
		expect( result.current ).toEqual( {
			credits: 500,
			hasDomainProration: false,
			hasOtherUpgradeProration: true,
		} );
	} );

	test( 'Returns credits + both flags when both proration overrides exist', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 700 );
		jest.mocked( useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [
							{ overrideCode: COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION },
							{ overrideCode: COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION },
						],
					},
				},
			},
		} as UseQueryResult< { free_plan: SitePlan } > );

		const { result } = renderHookWithProvider( () =>
			useProrationUpgradeCreditsApplicable( siteId )
		);
		expect( result.current ).toEqual( {
			credits: 700,
			hasDomainProration: true,
			hasOtherUpgradeProration: true,
		} );
	} );
} );
