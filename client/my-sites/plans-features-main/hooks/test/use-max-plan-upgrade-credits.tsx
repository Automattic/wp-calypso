/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_ECOMMERCE,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { vi } from 'vitest';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useMaxPlanUpgradeCredits } from '../use-max-plan-upgrade-credits';
import type { PlanSlug } from '@automattic/calypso-products';

vi.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => ( { default: vi.fn() } )
);

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
		usePricingMetaForGridPlans: vi.fn(),
		useSitePlans: vi.fn(),
	},
} ) );

const siteId = 9999999;
const plans: PlanSlug[] = [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ];

describe( 'useCalculateMaxPlanUpgradeCredit hook', () => {
	beforeEach( () => {
		vi.resetAllMocks();
		Plans.useSitePlans.mockImplementation( () => ( { data: {} } ) );
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_FREE ]: {
				originalPrice: { full: 2000 },
				discountedPrice: { full: 2000 * 0.9 },
			},
			[ PLAN_PERSONAL ]: {
				originalPrice: { full: 4000 },
				discountedPrice: { full: 4000 * 0.9 },
			},
			[ PLAN_PREMIUM ]: {
				originalPrice: { full: 6000 },
				discountedPrice: { full: 6000 * 0.9 },
			},
			[ PLAN_BUSINESS ]: {
				originalPrice: { full: 8000 },
				discountedPrice: { full: 8000 * 0.9 },
			},
			[ PLAN_ECOMMERCE ]: {
				originalPrice: { full: 10000 },
				discountedPrice: { full: 10000 * 0.9 },
			},
		} ) );
		useCheckPlanAvailabilityForPurchase.mockImplementation( ( { planSlugs } ) =>
			planSlugs.reduce( ( acc, planSlug ) => {
				return {
					...acc,
					[ planSlug ]: true,
				};
			}, {} )
		);
	} );

	test( 'Return the correct amount of credits given a plan list', () => {
		const { result } = renderHookWithProvider( () =>
			useMaxPlanUpgradeCredits( { siteId, plans } )
		);
		expect( result.current ).toEqual( 1000 );
	} );

	test( 'Return total multi-year proration credit from cost_overrides when recent-plan-proration override is present', () => {
		Plans.useSitePlans.mockImplementation( () => ( {
			data: {
				[ PLAN_ECOMMERCE ]: {
					pricing: {
						costOverrides: [
							// old_price / new_price are in major currency units (dollars), not cents
							{ overrideCode: 'multiterm-upgrade', oldPrice: 100, newPrice: 500 },
							{ overrideCode: 'recent-plan-proration', oldPrice: 500, newPrice: 4.04 },
						],
					},
				},
			},
		} ) );

		const { result } = renderHookWithProvider( () =>
			useMaxPlanUpgradeCredits( { siteId, plans } )
		);
		// recent-plan-proration: (500 - 4.04) * 100 = 49596 cents ≈ $495.96, which is larger
		// than any originalPrice - discountedPrice from the mock (max = 1000 cents for ecommerce)
		expect( result.current ).toEqual( 49596 );
	} );

	test( 'Return the next correct credit amount when ecommerce plan is not available for purchase', () => {
		useCheckPlanAvailabilityForPurchase.mockImplementation( ( { planSlugs } ) =>
			planSlugs.reduce( ( acc, planSlug ) => {
				return {
					...acc,
					[ planSlug ]: planSlug !== PLAN_ECOMMERCE,
				};
			}, {} )
		);

		const { result } = renderHookWithProvider( () =>
			useMaxPlanUpgradeCredits( { siteId, plans } )
		);
		expect( result.current ).toEqual( 800 );
	} );
} );
