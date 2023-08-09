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
jest.mock( 'calypso/state/sites/selectors/get-site-plan-slug', () => jest.fn() );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn() );
jest.mock( 'calypso/my-sites/plans-features-main/hooks/data-store/use-priced-api-plans', () =>
	jest.fn()
);

import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import usePricedAPIPlans from 'calypso/my-sites/plans-features-main/hooks/data-store/use-priced-api-plans';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import {
	getSitePlanRawPrice,
	isPlanAvailableForPurchase,
} from 'calypso/state/sites/plans/selectors';
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import usePricingMetaForGridPlans from '../data-store/use-pricing-meta-for-grid-plans';

describe( 'usePricingMetaForGridPlans', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		usePricedAPIPlans.mockImplementation( () => ( {
			[ PLAN_PREMIUM ]: {
				bill_period: 365,
				currency_code: 'USD',
			},
			[ PLAN_PERSONAL ]: {
				bill_period: 365,
				currency_code: 'USD',
			},
		} ) );
	} );

	it( 'should return the original price as the site plan price and discounted price as Null for the current plan', () => {
		getSitePlanSlug.mockImplementation( () => PLAN_PREMIUM );
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
		getSitePlanSlug.mockImplementation( () => PLAN_PREMIUM );
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
		getSitePlanSlug.mockImplementation( () => PLAN_PREMIUM );
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
		getSitePlanSlug.mockImplementation( () => PLAN_PREMIUM );
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
