/**
 * @jest-environment jsdom
 */

/**
 * Default mock implementations
 */
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	createSelector: jest.fn(),
	register: jest.fn(),
	useDispatch: jest.fn(),
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
jest.mock( '../../../wpcom-plans-ui', () => ( {
	store: 'wpcom-plans-ui',
} ) );

import { PLAN_PERSONAL, PLAN_BUSINESS } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import * as Plans from '../../';
import { ADD_ON_50GB_STORAGE } from '../../../add-ons/constants';
import { STORAGE_ADD_ONS_MOCK } from '../../../add-ons/mocks';
import * as Purchases from '../../../purchases';
import * as WpcomPlansUI from '../../../wpcom-plans-ui';
import { COST_OVERRIDE_REASONS } from '../../constants';
import usePricingMetaForGridPlans from '../use-pricing-meta-for-grid-plans';

const siteId = 100;
const SITE_PLANS = {
	[ PLAN_BUSINESS ]: {
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
	[ PLAN_BUSINESS ]: {
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
		[ PLAN_BUSINESS ]: true,
		[ PLAN_PERSONAL ]: true,
	};
};

describe( 'usePricingMetaForGridPlans', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Purchases.useSitePurchaseById.mockImplementation( () => undefined );
		Plans.useIntroOffers.mockImplementation( () => ( {
			[ PLAN_BUSINESS ]: null,
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

	it( 'should return the original price as the site plan price and discounted price as Null for the current plan', () => {
		Plans.useCurrentPlan.mockImplementation( () => ( {
			productSlug: PLAN_BUSINESS,
			planSlug: PLAN_BUSINESS,
		} ) );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			storageAddOns: null,
			siteId,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
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
			productSlug: PLAN_BUSINESS,
			planSlug: PLAN_BUSINESS,
		} ) );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			storageAddOns: null,
			siteId,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
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

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			storageAddOns: null,
			siteId: undefined,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
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

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			storageAddOns: null,
			siteId,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
			withProratedDiscounts: true,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
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
				[ PLAN_BUSINESS ]: {
					...SITE_PLANS[ PLAN_BUSINESS ],
					pricing: {
						...SITE_PLANS[ PLAN_BUSINESS ].pricing,
						costOverrides: [ { overrideCode: COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION } ],
					},
				},
			},
		} ) );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			storageAddOns: null,
			siteId,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
			withProratedDiscounts: false,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
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

	it( 'should return intro offer when available', () => {
		Plans.useIntroOffers.mockImplementation( () => ( {
			[ PLAN_BUSINESS ]: introOffer,
		} ) );
		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_BUSINESS ]: {
					...SITE_PLANS[ PLAN_BUSINESS ],
					pricing: {
						...SITE_PLANS[ PLAN_BUSINESS ].pricing,
						introOffer,
					},
				},
			},
		} ) );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			storageAddOns: null,
			siteId,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
				...SITE_PLANS[ PLAN_BUSINESS ].pricing,
				billPeriod: undefined,
				billingPeriod: SITE_PLANS[ PLAN_BUSINESS ].pricing.billPeriod,
				expiry: null,
				introOffer,
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );

	it( 'should return intro offer pricing and standard pricing adjusted by storage selection', () => {
		Plans.useIntroOffers.mockImplementation( () => ( {
			[ PLAN_BUSINESS ]: introOffer,
		} ) );
		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_BUSINESS ]: {
					...SITE_PLANS[ PLAN_BUSINESS ],
					pricing: {
						...SITE_PLANS[ PLAN_BUSINESS ].pricing,
						introOffer,
					},
				},
			},
		} ) );
		useSelect.mockImplementation( ( selectFunc ) => {
			const select = ( store ) => {
				if ( store === WpcomPlansUI.store ) {
					return {
						getSelectedStorageOptions: () => ( {
							[ PLAN_BUSINESS ]: ADD_ON_50GB_STORAGE,
						} ),
					};
				}

				return null;
			};

			return selectFunc( select );
		} );

		const pricingMeta = usePricingMetaForGridPlans( {
			planSlugs: [ PLAN_BUSINESS ],
			reflectStorageSelectionInPlanPrices: true,
			storageAddOns: STORAGE_ADD_ONS_MOCK,
			siteId,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} );

		const expectedPricingMeta = {
			[ PLAN_BUSINESS ]: {
				originalPrice: {
					full:
						SITE_PLANS[ PLAN_BUSINESS ].pricing.originalPrice.full +
						STORAGE_ADD_ONS_MOCK[ 0 ].prices.yearlyPrice,
					monthly:
						SITE_PLANS[ PLAN_BUSINESS ].pricing.originalPrice.monthly +
						STORAGE_ADD_ONS_MOCK[ 0 ].prices.monthlyPrice,
				},
				discountedPrice: {
					full:
						SITE_PLANS[ PLAN_BUSINESS ].pricing.discountedPrice.full +
						STORAGE_ADD_ONS_MOCK[ 0 ].prices.yearlyPrice,
					monthly:
						SITE_PLANS[ PLAN_BUSINESS ].pricing.discountedPrice.monthly +
						STORAGE_ADD_ONS_MOCK[ 0 ].prices.monthlyPrice,
				},
				billingPeriod: SITE_PLANS[ PLAN_BUSINESS ].pricing.billPeriod,
				currencyCode: SITE_PLANS[ PLAN_BUSINESS ].pricing.currencyCode,
				expiry: null,
				introOffer: {
					...introOffer,
					rawPrice: {
						monthly: 12.5 + STORAGE_ADD_ONS_MOCK[ 0 ].prices.monthlyPrice,
						full: 150 + STORAGE_ADD_ONS_MOCK[ 0 ].prices.yearlyPrice,
					},
				},
			},
		};

		expect( pricingMeta ).toEqual( expectedPricingMeta );
	} );
} );
