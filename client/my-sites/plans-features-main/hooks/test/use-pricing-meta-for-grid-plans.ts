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
jest.mock( '@wordpress/data' );
jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanPrices: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: jest.fn(),
	getSitePlanRawPrice: jest.fn(),
	isPlanAvailableForPurchase: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn() );
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getByPurchaseId: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		usePlans: jest.fn(),
		useSitePlans: jest.fn(),
		useIntroOffers: jest.fn(),
	},
} ) );

import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import {
	getCurrentPlan,
	getSitePlanRawPrice,
	isPlanAvailableForPurchase,
} from 'calypso/state/sites/plans/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import usePricingMetaForGridPlans from '../data-store/use-pricing-meta-for-grid-plans';

describe( 'usePricingMetaForGridPlans', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Plans.useSitePlans.mockImplementation( () => ( {
			isFetching: false,
			data: null,
		} ) );
		getByPurchaseId.mockImplementation( () => undefined );
		Plans.usePlans.mockImplementation( () => ( {
			isFetching: false,
			data: {
				[ PLAN_PREMIUM ]: {
					billPeriod: 365,
					currencyCode: 'USD',
				},
				[ PLAN_PERSONAL ]: {
					billPeriod: 365,
					currencyCode: 'USD',
				},
			},
		} ) );
	} );

	it( 'should return the original price as the site plan price and discounted price as Null for the current plan', () => {
		getCurrentPlan.mockImplementation( () => ( { productSlug: PLAN_PREMIUM } ) );
		getSelectedSiteId.mockImplementation( () => 100 );
		getPlanPrices.mockImplementation( () => null );
		getSitePlanRawPrice.mockImplementation( () => 300 );
		isPlanAvailableForPurchase.mockImplementation( () => false );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			withoutProRatedCredits: false,
		} );

		const expectedPricingMeta = {
			[ PLAN_PREMIUM ]: {
				originalPrice: {
					full: 300,
					monthly: 300,
				},
				discountedPrice: {
					full: null,
					monthly: null,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price as the site plan price and discounted price as Null for plans not available for purchase', () => {
		getCurrentPlan.mockImplementation( () => ( { productSlug: PLAN_PREMIUM } ) );
		getSelectedSiteId.mockImplementation( () => 100 );
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );
		getSitePlanRawPrice.mockImplementation( () => null );
		isPlanAvailableForPurchase.mockImplementation( () => false );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PERSONAL ],
			withoutProRatedCredits: false,
		} );

		const expectedPricingMeta = {
			[ PLAN_PERSONAL ]: {
				originalPrice: {
					full: 300,
					monthly: 300,
				},
				discountedPrice: {
					full: null,
					monthly: null,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price and discounted price without pro-rated credits when withoutProRatedCredits is true', () => {
		getCurrentPlan.mockImplementation( () => ( { productSlug: PLAN_PREMIUM } ) );
		getSelectedSiteId.mockImplementation( () => 100 );
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );
		getSitePlanRawPrice.mockImplementation( () => null );
		isPlanAvailableForPurchase.mockImplementation( () => true );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PERSONAL ],
			withoutProRatedCredits: true,
		} );

		const expectedPricingMeta = {
			[ PLAN_PERSONAL ]: {
				originalPrice: {
					full: 300,
					monthly: 300,
				},
				discountedPrice: {
					full: 200,
					monthly: 200,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price and discounted price with pro-rated credits when withoutProRatedCredits is false', () => {
		getCurrentPlan.mockImplementation( () => ( { productSlug: PLAN_PREMIUM } ) );
		getSelectedSiteId.mockImplementation( () => 100 );
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );
		getSitePlanRawPrice.mockImplementation( () => null );
		isPlanAvailableForPurchase.mockImplementation( () => true );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PERSONAL ],
			withoutProRatedCredits: false,
		} );

		const expectedPricingMeta = {
			[ PLAN_PERSONAL ]: {
				originalPrice: {
					full: 300,
					monthly: 300,
				},
				discountedPrice: {
					full: 100,
					monthly: 100,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );
} );
