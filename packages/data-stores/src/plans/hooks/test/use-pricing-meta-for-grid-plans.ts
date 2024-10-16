/**
 * @jest-environment jsdom
 */

/**
 * Default mock implementations
 */
jest.mock( '@wordpress/data' );
// jest.mock( '@automattic/data-stores', () => ( {
// 	Plans: {
// 		usePlans: jest.fn(),
// 		useSitePlans: jest.fn(),
// 		useIntroOffers: jest.fn(),
// 		useCurrentPlan: jest.fn(),
// 	},
// 	Purchases: {
// 		useSitePurchaseById: jest.fn(),
// 	},
// } ) );

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
import { COST_OVERRIDE_REASONS } from '../../constants';
import usePricingMetaForGridPlans from '../use-pricing-meta-for-grid-plans';

const SITE_PLANS = {
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
};

const PLANS = {
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
};

describe( 'usePricingMetaForGridPlans', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Purchases.useSitePurchaseById.mockImplementation( () => undefined );
		Plans.useIntroOffers.mockImplementation( () => ( {
			[ PLAN_PREMIUM ]: null,
		} ) );
		Plans.usePlans.mockImplementation( () => ( {
			isLoading: false,
			data: PLANS,
		} ) );
		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: SITE_PLANS,
		} ) );
		Plans.useCurrentPlan.mockImplementation( () => undefined );
	} );

	it( 'should return intro offer when available', () => {
		const introOffer = {
			formattedPrice: '$150',
			rawPrice: {
				monthly: 12.5,
				full: 150,
			},
			isOfferComplete: false,
			intervalUnit: 'year',
			intervalCount: 1,
		};

		const useCheckPlanAvailabilityForPurchase = () => {
			return {
				[ PLAN_PREMIUM ]: true,
			};
		};

		Plans.useIntroOffers.mockImplementation( () => ( {
			[ PLAN_PREMIUM ]: introOffer,
		} ) );
		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_PREMIUM ]: {
					...SITE_PLANS[ PLAN_PREMIUM ],
					pricing: {
						...SITE_PLANS[ PLAN_PREMIUM ].pricing,
						introOffer,
					},
				},
			},
		} ) );

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
					full: 250,
					monthly: 250,
				},
				billingPeriod: 365,
				currencyCode: 'USD',
				expiry: null,
				introOffer,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
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
				introOffer: undefined,
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
				introOffer: undefined,
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
				introOffer: undefined,
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
				introOffer: undefined,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return the original price and discounted price when site id is passed and withProratedDiscounts is false', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_PERSONAL,
			planSlug: PLAN_PERSONAL,
		} ) );

		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_PREMIUM ]: {
					...SITE_PLANS[ PLAN_PREMIUM ],
					pricing: {
						...SITE_PLANS[ PLAN_PREMIUM ].pricing,
						costOverrides: [ { overrideCode: COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION } ],
					},
				},
			},
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
				introOffer: undefined,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );
} );
