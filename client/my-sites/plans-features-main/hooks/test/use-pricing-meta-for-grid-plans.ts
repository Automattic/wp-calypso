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
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn() );
jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		usePlans: jest.fn(),
		useSitePlans: jest.fn(),
		useIntroOffers: jest.fn(),
		useCurrentPlan: jest.fn(),
	},
	Purchases: {
		useSitePurchaseById: jest.fn(),
	},
} ) );
jest.mock( '../use-check-plan-availability-for-purchase', () => jest.fn() );

import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Plans, Purchases } from '@automattic/data-stores';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import usePricingMetaForGridPlans from '../data-store/use-pricing-meta-for-grid-plans';
import useCheckPlanAvailabilityForPurchase from '../use-check-plan-availability-for-purchase';

describe( 'usePricingMetaForGridPlans', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		getSelectedSiteId.mockImplementation( () => 100 );
		Purchases.useSitePurchaseById.mockImplementation( () => undefined );
		Plans.useIntroOffers.mockImplementation( () => ( {
			[ PLAN_PREMIUM ]: null,
		} ) );
		Plans.usePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_PREMIUM ]: {
					pricing: {
						billPeriod: 365,
						currencyCode: 'USD',
						originalPrice: {
							full: 500,
							monthly: 500,
						},
						discountedPrice: {
							full: 400,
							monthly: 400,
						},
					},
				},
			},
		} ) );
		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_PREMIUM ]: {
					expiry: null,
					pricing: {
						billPeriod: 365,
						currencyCode: 'USD',
						originalPrice: {
							full: 500,
							monthly: 500,
						},
						discountedPrice: {
							full: 250,
							monthly: 250,
						},
					},
				},
			},
		} ) );
		Plans.useCurrentPlan.mockImplementation( () => undefined );
	} );

	it( 'should return the original price as the site plan price and discounted price as Null for the current plan', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PREMIUM,
			planSlug: PLAN_PREMIUM,
		} ) );
		useCheckPlanAvailabilityForPurchase.mockImplementation( () => {
			return {
				[ PLAN_PREMIUM ]: true,
			};
		} );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			withoutProRatedCredits: false,
			storageAddOns: null,
		} );

		const expectedPricingMeta = {
			[ PLAN_PREMIUM ]: {
				originalPrice: {
					full: 500,
					monthly: 500,
				},
				discountedPrice: {
					full: null,
					monthly: null,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
				expiry: null,
				introOffer: null,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price as the site plan price and discounted price as Null for plans not available for purchase', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PREMIUM,
			planSlug: PLAN_PREMIUM,
		} ) );
		useCheckPlanAvailabilityForPurchase.mockImplementation( () => {
			return {
				[ PLAN_PREMIUM ]: false,
			};
		} );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			withoutProRatedCredits: false,
			storageAddOns: null,
		} );

		const expectedPricingMeta = {
			[ PLAN_PREMIUM ]: {
				originalPrice: {
					full: 500,
					monthly: 500,
				},
				discountedPrice: {
					full: null,
					monthly: null,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
				expiry: null,
				introOffer: null,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price and discounted price (prorated) when withoutProRatedCredits is false', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PERSONAL,
			planSlug: PLAN_PERSONAL,
		} ) );
		useCheckPlanAvailabilityForPurchase.mockImplementation( () => {
			return {
				[ PLAN_PERSONAL ]: true,
				[ PLAN_PREMIUM ]: true,
			};
		} );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			withoutProRatedCredits: false,
			storageAddOns: null,
		} );

		const expectedPricingMeta = {
			[ PLAN_PREMIUM ]: {
				originalPrice: {
					full: 500,
					monthly: 500,
				},
				discountedPrice: {
					full: 250,
					monthly: 250,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
				expiry: null,
				introOffer: null,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price and discounted price (not prorated) when withoutProRatedCredits is true', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PERSONAL,
			planSlug: PLAN_PERSONAL,
		} ) );
		useCheckPlanAvailabilityForPurchase.mockImplementation( () => {
			return {
				[ PLAN_PREMIUM ]: true,
				[ PLAN_PERSONAL ]: true,
			};
		} );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			withoutProRatedCredits: true,
			storageAddOns: null,
		} );

		const expectedPricingMeta = {
			[ PLAN_PREMIUM ]: {
				originalPrice: {
					full: 500,
					monthly: 500,
				},
				discountedPrice: {
					full: 400,
					monthly: 400,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
				expiry: null,
				introOffer: null,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );
} );
