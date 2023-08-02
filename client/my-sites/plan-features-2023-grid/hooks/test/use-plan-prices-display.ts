/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: ( selector ) => selector(),
} ) );
jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanPrices: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getSitePlanRawPrice: jest.fn(),
	isPlanAvailableForPurchase: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn( () => 1 ),
} ) );
import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import {
	getSitePlanRawPrice,
	isPlanAvailableForPurchase,
} from 'calypso/state/sites/plans/selectors';
import { usePlanPricesDisplay } from '../use-plan-prices-display';

describe( 'usePlanPricesDisplay', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return the original price as the site plan price and discounted price as 0 for the current plan', () => {
		getPlanPrices.mockImplementation( () => null );
		getSitePlanRawPrice.mockImplementation( () => 300 );
		isPlanAvailableForPurchase.mockImplementation( () => false );

		const planPrices = usePlanPricesDisplay( {
			siteId: 100,
			planSlug: PLAN_PREMIUM,
			currentSitePlanSlug: PLAN_PREMIUM,
			returnMonthly: true,
			withoutProRatedCredits: false,
		} );

		expect( planPrices ).toEqual( {
			originalPrice: 300,
			discountedPrice: 0,
		} );
	} );

	it( 'should return the original price as the site plan price and discounted price as 0 for plans not available for purchase', () => {
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );
		getSitePlanRawPrice.mockImplementation( () => null );
		isPlanAvailableForPurchase.mockImplementation( () => false );

		const planPrices = usePlanPricesDisplay( {
			siteId: 100,
			planSlug: PLAN_PERSONAL,
			currentSitePlanSlug: PLAN_PREMIUM,
			returnMonthly: true,
			withoutProRatedCredits: false,
		} );

		expect( planPrices ).toEqual( {
			originalPrice: 300,
			discountedPrice: 0,
		} );
	} );

	it( 'should return the original price and discounted price without pro-rated credits when withoutProRatedCredits is true', () => {
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );
		getSitePlanRawPrice.mockImplementation( () => null );
		isPlanAvailableForPurchase.mockImplementation( () => true );

		const planPrices = usePlanPricesDisplay( {
			siteId: 100,
			planSlug: PLAN_PERSONAL,
			currentSitePlanSlug: PLAN_PREMIUM,
			returnMonthly: true,
			withoutProRatedCredits: true,
		} );

		expect( planPrices ).toEqual( {
			originalPrice: 300,
			discountedPrice: 200,
		} );
	} );

	it( 'should return the original price and discounted price with pro-rated credits when withoutProRatedCredits is false', () => {
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );
		getSitePlanRawPrice.mockImplementation( () => null );
		isPlanAvailableForPurchase.mockImplementation( () => true );

		const planPrices = usePlanPricesDisplay( {
			siteId: 100,
			planSlug: PLAN_PERSONAL,
			currentSitePlanSlug: PLAN_PREMIUM,
			returnMonthly: true,
			withoutProRatedCredits: false,
		} );

		expect( planPrices ).toEqual( {
			originalPrice: 300,
			discountedPrice: 100,
		} );
	} );
} );
