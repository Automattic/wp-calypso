/**
 * @vitest-environment jsdom
 */

import { PLAN_FREE } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { vi } from 'vitest';
import { useMaxPlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits';
import { usePlanUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable';
import { useUpgradeCreditsNoticeData } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable', () => ( {
	usePlanUpgradeCreditsApplicable: vi.fn(),
} ) );

vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: vi.fn(),
} ) );

vi.mock( '@automattic/data-stores', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/data-stores' ) >(
		'@automattic/data-stores'
	) ),
	Plans: {
		...(
			await vi.importActual< typeof import( '@automattic/data-stores' ) >(
				'@automattic/data-stores'
			)
		).Plans,
		useSitePlans: vi.fn(),
	},
} ) );

const siteId = 1;
type SitePlansQueryResult = ReturnType< typeof Plans.useSitePlans >;

describe( 'useUpgradeCreditsNoticeData', () => {
	beforeEach( () => {
		vi.resetAllMocks();
		vi.mocked( usePlanUpgradeCreditsApplicable ).mockReturnValue( null );
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {},
		} as unknown as SitePlansQueryResult );
	} );

	test( 'prefers paid-plan upgrade credits when eligible (source: plan)', () => {
		vi.mocked( usePlanUpgradeCreditsApplicable ).mockReturnValue( 100 );
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 500 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 500 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 300 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 300 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( usePlanUpgradeCreditsApplicable ).mockReturnValue( 100 );
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
			data: {},
		} as unknown as SitePlansQueryResult );

		const { result } = renderHookWithProvider( () => useUpgradeCreditsNoticeData( siteId, [] ) );
		expect( result.current ).toBeNull();
	} );

	test( 'does not infer combined source when domain proration exists alongside a non-coupon discount (without explicit plan proration override)', () => {
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 700 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 700 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
		vi.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		vi.mocked( Plans.useSitePlans ).mockReturnValue( {
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
