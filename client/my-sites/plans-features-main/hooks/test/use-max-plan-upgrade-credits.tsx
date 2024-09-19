/**
 * @jest-environment jsdom
 */
import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_ECOMMERCE,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useMaxPlanUpgradeCredits } from '../use-max-plan-upgrade-credits';
import type { PlanSlug } from '@automattic/calypso-products';

jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => jest.fn()
);

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );

const siteId = 9999999;
const plans: PlanSlug[] = [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ];

describe( 'useCalculateMaxPlanUpgradeCredit hook', () => {
	beforeEach( () => {
		jest.resetAllMocks();
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
