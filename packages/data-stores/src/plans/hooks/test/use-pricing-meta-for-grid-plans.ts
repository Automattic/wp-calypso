/**
 * @jest-environment jsdom
 */

/**
 * Default mock implementations
 */
jest.mock( '@wordpress/data' );
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

jest.mock( '../../', () => ( {
	usePlans: jest.fn(),
	useSitePlans: jest.fn(),
	useIntroOffers: jest.fn(),
	useCurrentPlan: jest.fn(),
} ) );

jest.mock( '../../../purchases', () => ( {
	useSitePurchaseById: jest.fn(),
} ) );

import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import * as Plans from '../../';
import * as Purchases from '../../../purchases';
import usePricingMetaForGridPlans from '../use-pricing-meta-for-grid-plans';

describe( 'usePricingMetaForGridPlans', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
						costOverrides: [
							{
								overrideCode: 'recent-plan-proration',
							},
						],
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

		const useCheckPlanAvailabilityForPurchase = () => {
			return {
				[ PLAN_PREMIUM ]: true,
			};
		};

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			storageAddOns: null,
			siteId: 100,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
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

		const useCheckPlanAvailabilityForPurchase = () => {
			return {
				[ PLAN_PREMIUM ]: false,
			};
		};

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			storageAddOns: null,
			siteId: 100,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
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

	it( 'should return the original price and discounted price when no site id is passed', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PERSONAL,
			planSlug: PLAN_PERSONAL,
		} ) );

		const useCheckPlanAvailabilityForPurchase = () => {
			return {
				[ PLAN_PREMIUM ]: true,
				[ PLAN_PERSONAL ]: true,
			};
		};

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			storageAddOns: null,
			siteId: undefined,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
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

	it( 'should return the original price and discounted price when site id is passed and withProratedDiscounts is true', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PERSONAL,
			planSlug: PLAN_PERSONAL,
		} ) );

		const useCheckPlanAvailabilityForPurchase = () => {
			return {
				[ PLAN_PREMIUM ]: true,
				[ PLAN_PERSONAL ]: true,
			};
		};

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			storageAddOns: null,
			siteId: 100,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
			withProratedDiscounts: true,
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

	it( 'should return the original price and discounted price when site id is passed and withProratedDiscounts is false', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PERSONAL,
			planSlug: PLAN_PERSONAL,
		} ) );

		const useCheckPlanAvailabilityForPurchase = () => {
			return {
				[ PLAN_PREMIUM ]: true,
				[ PLAN_PERSONAL ]: true,
			};
		};

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_PREMIUM ],
			storageAddOns: null,
			siteId: 100,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
			withProratedDiscounts: false,
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
} );
