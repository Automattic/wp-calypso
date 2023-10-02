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
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSitePlanRawPrice } from 'calypso/state/sites/plans/selectors/get-site-plan-raw-price';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useCalculateMaxPlanUpgradeCredit } from '../use-calculate-max-plan-upgrade-credit';
import type { PlanSlug } from '@automattic/calypso-products';

jest.mock( 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/plans/selectors/get-site-plan-raw-price', () => ( {
	getSitePlanRawPrice: jest.fn(),
} ) );

const mGetPlanDiscountedRawPrice = getPlanDiscountedRawPrice as jest.MockedFunction<
	typeof getPlanDiscountedRawPrice
>;
const mGetSitePlanRawPrice = getSitePlanRawPrice as jest.MockedFunction<
	typeof getSitePlanRawPrice
>;
const mIsPlanAvailableForPurchase = isPlanAvailableForPurchase as jest.MockedFunction<
	typeof isPlanAvailableForPurchase
>;

const siteId = 9999999;
const plans: PlanSlug[] = [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ];

describe( 'useCalculateMaxPlanUpgradeCredit hook', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		mGetSitePlanRawPrice.mockImplementation( ( _state, _siteId, planSlug ) => {
			switch ( planSlug ) {
				case PLAN_FREE:
					return 2000;
				case PLAN_PERSONAL:
					return 4000;
				case PLAN_PREMIUM:
					return 6000;
				case PLAN_BUSINESS:
					return 8000;
				case PLAN_ECOMMERCE:
					return 10000;
				default:
					return 0;
			}
		} );
		mGetPlanDiscountedRawPrice.mockImplementation( ( _state, _siteId, planSlug ) => {
			switch ( planSlug ) {
				case PLAN_FREE:
					return 2000 * 0.9;
				case PLAN_PERSONAL:
					return 4000 * 0.9;
				case PLAN_PREMIUM:
					return 6000 * 0.9;
				case PLAN_BUSINESS:
					return 8000 * 0.9;
				case PLAN_ECOMMERCE:
					return 10000 * 0.9;
				default:
					return 0;
			}
		} );

		mIsPlanAvailableForPurchase.mockImplementation( () => true );
	} );

	test( 'Return the correct amount of credits given a plan list', () => {
		const { result } = renderHookWithProvider( () =>
			useCalculateMaxPlanUpgradeCredit( { siteId, plans } )
		);
		expect( result.current ).toEqual( 1000 );
	} );

	test( 'Return the next correct credit amount when ecommerce plan is not available for purchase', () => {
		mIsPlanAvailableForPurchase.mockImplementation(
			( _state, _siteId, planName ) => ! ( planName === PLAN_ECOMMERCE )
		);

		const { result } = renderHookWithProvider( () =>
			useCalculateMaxPlanUpgradeCredit( { siteId, plans } )
		);
		expect( result.current ).toEqual( 800 );
	} );
} );
