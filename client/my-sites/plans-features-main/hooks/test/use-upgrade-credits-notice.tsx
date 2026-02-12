/**
 * @jest-environment jsdom
 */

import { PLAN_FREE } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useMaxPlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits';
import { usePlanUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable';
import { useUpgradeCreditsNoticeData } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable',
	() => ( {
		usePlanUpgradeCreditsApplicable: jest.fn(),
	} )
);

jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		useSitePlans: jest.fn(),
	},
} ) );

const siteId = 1;
type SitePlansQueryResult = ReturnType< typeof Plans.useSitePlans >;

describe( 'useUpgradeCreditsNoticeData', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		jest.mocked( usePlanUpgradeCreditsApplicable ).mockReturnValue( null );
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {},
		} as unknown as SitePlansQueryResult );
	} );

	test( 'prefers paid-plan upgrade credits when eligible (source: plan)', () => {
		jest.mocked( usePlanUpgradeCreditsApplicable ).mockReturnValue( 100 );
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 500 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION },
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION },
						],
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () =>
			useUpgradeCreditsNoticeData( siteId, [ PLAN_FREE ] )
		);
		expect( result.current ).toEqual( { credits: 100, source: 'plan' } );
	} );

	test( 'returns domain proration credits when domain proration exists', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION },
						],
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toEqual( { credits: 1000, source: 'domain' } );
	} );

	test( 'returns other-upgrades proration credits when plan proration exists', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 500 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [ { overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION } ],
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toEqual( { credits: 500, source: 'other-upgrades' } );
	} );

	test( 'returns other-upgrades proration credits when site plan pricing is discounted without a coupon or cost override', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 300 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						hasSaleCoupon: false,
						discountedPrice: { full: 900, monthly: 75 },
						originalPrice: { full: 1200, monthly: 100 },
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toEqual( { credits: 300, source: 'other-upgrades' } );
	} );

	test( 'returns null when proration exists but maxCredits is 0', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION },
						],
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toBeNull();
	} );

	test( 'does not infer other-upgrades proration when a sale coupon is present', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 300 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						hasSaleCoupon: true,
						discountedPrice: { full: 900, monthly: 75 },
						originalPrice: { full: 1200, monthly: 100 },
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toBeNull();
	} );

	test( 'does not return plan credits when visiblePlans is empty (even if plan credits are available)', () => {
		jest.mocked( usePlanUpgradeCreditsApplicable ).mockReturnValue( 100 );
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toBeNull();
	} );

	test( 'does not infer combined source when domain proration exists alongside a non-coupon discount (without explicit plan proration override)', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 700 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION },
						],
						hasSaleCoupon: false,
						discountedPrice: { full: 900, monthly: 75 },
						originalPrice: { full: 1600, monthly: 133.33 },
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toEqual( { credits: 700, source: 'domain' } );
	} );

	test( 'returns combined source when both proration reasons exist', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 700 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION },
							{ overrideCode: Plans.COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION },
						],
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toEqual( { credits: 700, source: 'domain-and-other-upgrades' } );
	} );

	test( 'returns null when no proration exists and paid upgrade is not applicable', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		jest.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: {
						costOverrides: [ { overrideCode: 'some-other-override' } ],
					},
				},
			},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toBeNull();
	} );
} );
