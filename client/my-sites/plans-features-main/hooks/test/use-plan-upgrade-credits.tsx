import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { usePlanUpgradeCredits } from '../use-plan-upgrade-credits';
import type { PlanSlug } from '@automattic/calypso-products';

jest.mock( 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanPrices: jest.fn(),
} ) );
const mGetPlanPrices = getPlanPrices as jest.MockedFunction< typeof getPlanPrices >;
const mIsPlanAvailableForPurchase = isPlanAvailableForPurchase as jest.MockedFunction<
	typeof isPlanAvailableForPurchase
>;

const siteId = 9999999;
const plansList: PlanSlug[] = [
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_ENTERPRISE_GRID_WPCOM,
];

describe( 'usePlanUpgradeCredits hook', () => {
	beforeEach( () => {
		mGetPlanPrices.mockImplementation( ( s, { planSlug } ) => {
			switch ( planSlug ) {
				case PLAN_FREE:
					return {
						rawPrice: 2000,
						discountedRawPrice: 50,
						planDiscountedRawPrice: 2000 * 0.9,
					};
				case PLAN_PERSONAL:
					return {
						rawPrice: 4000,
						discountedRawPrice: 50,
						planDiscountedRawPrice: 4000 * 0.9,
					};
				case PLAN_PREMIUM:
					return {
						rawPrice: 6000,
						discountedRawPrice: 50,
						planDiscountedRawPrice: 6000 * 0.9,
					};
				case PLAN_BUSINESS:
					return {
						rawPrice: 8000,
						discountedRawPrice: 50,
						planDiscountedRawPrice: 8000 * 0.9,
					};
				case PLAN_ECOMMERCE:
					return {
						rawPrice: 10000,
						planDiscountedRawPrice: 10000 * 0.9,
					};

				default:
					return {
						rawPrice: 0,
						planDiscountedRawPrice: 0,
					};
			}
		} );

		mIsPlanAvailableForPurchase.mockImplementation( () => true );
	} );

	test( 'Return the correct amount of credits given a plan list', () => {
		const { result } = renderHookWithProvider( () => usePlanUpgradeCredits( siteId, plansList ) );
		expect( result.current ).toEqual( 1000 );
	} );

	test( 'Return the correct amount when ecommerce plan is not purchasable', () => {
		mIsPlanAvailableForPurchase.mockImplementation(
			( _state, _siteId, planName ) => ! ( planName === PLAN_ECOMMERCE )
		);

		const { result } = renderHookWithProvider( () => usePlanUpgradeCredits( siteId, plansList ) );
		expect( result.current ).toEqual( 800 );
	} );
} );
