/**
 * @vitest-environment jsdom
 */
import {
	PLAN_PERSONAL_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { vi } from 'vitest';
import useEquivalentMonthlyTotals from 'calypso/my-sites/checkout/utils/use-equivalent-monthly-totals';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

vi.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => ( { default: vi.fn() } )
);

vi.mock( '@automattic/data-stores', async () => ( {
	...( await vi.importActual( '@automattic/data-stores' ) ),
	Plans: {
		...( await vi.importActual( '@automattic/data-stores' ) ).Plans,
		usePricingMetaForGridPlans: vi.fn(),
	},
} ) );

describe( 'useEquivalentMonthlyTotals', () => {
	const business_2years = {
		...getEmptyResponseCartProduct(),
		product_name: 'Dotcom Business',
		product_slug: PLAN_BUSINESS_2_YEARS,
		currency: 'USD',
		extra: {},
		meta: 'test',
		product_id: 1,
		volume: 1,
		is_domain_registration: false,
		item_original_cost_integer: 100,
		item_subtotal_integer: 100,
		bill_period: '365',
		months_per_bill_period: 24,
	};
	const personal_monthly = {
		...getEmptyResponseCartProduct(),
		product_name: 'Dotcom Personal',
		product_slug: PLAN_PERSONAL_MONTHLY,
		currency: 'USD',
		extra: {},
		meta: 'test',
		product_id: 2,
		volume: 1,
		is_domain_registration: false,
		item_original_cost_integer: 50,
		item_subtotal_integer: 50,
		bill_period: '31',
		months_per_bill_period: 1,
	};
	const jetpack_yearly = {
		...getEmptyResponseCartProduct(),
		product_name: 'Jetpack Yearly',
		product_slug: PRODUCT_JETPACK_BACKUP_T0_YEARLY,
		currency: 'USD',
		extra: {},
		meta: 'test',
		product_id: 3,
		volume: 1,
		is_domain_registration: false,
		item_original_cost_integer: 70,
		item_subtotal_integer: 70,
		bill_period: '365',
		months_per_bill_period: 12,
	};

	beforeEach( () => {
		vi.resetAllMocks();
		useCheckPlanAvailabilityForPurchase.mockImplementation( ( { planSlugs } ) =>
			planSlugs.reduce( ( acc, planSlug ) => {
				return {
					...acc,
					[ planSlug ]: true,
				};
			}, {} )
		);
	} );

	it( 'returns calculated total only for non-monthly wpcom products', () => {
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 1000, full: 4000 },
			},
			[ PLAN_BUSINESS_MONTHLY ]: {
				originalPrice: { monthly: 4000, full: 4000 },
			},
		} ) );

		const { result } = renderHookWithProvider( () =>
			useEquivalentMonthlyTotals( [ business_2years, personal_monthly, jetpack_yearly ] )
		);
		expect( result.current ).toStrictEqual( { 'business-bundle-2y': 96000 } ); // 24 * 40
	} );

	it( 'correctly handles malformed plans data', () => {
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_BUSINESS_MONTHLY ]: {
				amount: 5,
			},
		} ) );
		const { result } = renderHookWithProvider( () =>
			useEquivalentMonthlyTotals( [ business_2years, personal_monthly, jetpack_yearly ] )
		);
		expect( result.current ).toStrictEqual( { 'business-bundle-2y': 0 } );
	} );
} );
