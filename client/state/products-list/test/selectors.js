import deepFreeze from 'deep-freeze';
import {
	getProductDisplayCost,
	isProductsListFetching,
	getProductsByBillingSlug,
} from '../selectors';

jest.mock( 'calypso/state/selectors/get-intro-offer-price', () => jest.fn() );

jest.mock( 'calypso/state/products-list/selectors/get-product-sale-coupon-cost', () => ( {
	getProductSaleCouponCost: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/products-list/selectors/get-product-sale-coupon-discount', () => ( {
	getProductSaleCouponDiscount: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/products-list/selectors/get-product-price-tiers', () => ( {
	getProductPriceTierList: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
	isIntroductoryOfferAppliedToPlanPrice: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	applyTestFiltersToPlansList: jest.fn( ( x ) => x ),
	getPlan: jest.fn(),
} ) );

jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanRawPrice: jest.fn(),
} ) );

describe( 'selectors', () => {
	describe( '#getProductDisplayCost()', () => {
		test( 'should return null when the products list has not been fetched', () => {
			const state = deepFreeze( { productsList: { items: {} } } );

			expect( getProductDisplayCost( state, 'business-bundle' ) ).toBe( null );
		} );

		test( 'should return the display cost', () => {
			const state = deepFreeze( {
				productsList: {
					items: {
						'business-bundle': {
							cost_display: 'A$169.00',
						},
					},
				},
			} );

			expect( getProductDisplayCost( state, 'business-bundle' ) ).toBe( 'A$169.00' );
		} );
	} );

	describe( '#isProductsListFetching()', () => {
		test( 'should return false when productsList.isFetching is false', () => {
			const state = { productsList: { isFetching: false } };
			expect( isProductsListFetching( state ) ).toBe( false );
		} );

		test( 'should return true when productsList.isFetching is true', () => {
			const state = { productsList: { isFetching: true } };
			expect( isProductsListFetching( state ) ).toBe( true );
		} );
	} );

	describe( '#getProductsByBillingSlug()', () => {
		const billingSlug = 'wp-mp-theme-tsubaki-test';

		const tsubaki = {
			product_id: 3001,
			product_name: 'Tsubaki Third-Party Test',
			product_slug: 'wp_mp_theme_tsubaki_test_yearly',
			description: '',
			product_type: 'marketplace_theme',
			available: true,
			billing_product_slug: 'wp-mp-theme-tsubaki-test',
			is_domain_registration: false,
			cost_display: 'US$100.00',
			combined_cost_display: 'US$100.00',
			cost: 100,
			cost_smallest_unit: 10000,
			currency_code: 'USD',
			price_tier_list: [],
			price_tier_usage_quantity: null,
			product_term: 'year',
			price_tiers: [],
			price_tier_slug: '',
		};

		const items = {
			wp_mp_theme_tsubaki_test_yearly: tsubaki,
		};

		test( 'Should return undefined if the items are empty', () => {
			const state = {
				productsList: {
					items: {},
				},
			};

			expect( getProductsByBillingSlug( state, billingSlug ) ).toBeUndefined();
		} );

		test( 'Should return undefined if the billing slug is not defined', () => {
			const state = {
				productsList: {
					items,
				},
			};

			expect( getProductsByBillingSlug( state ) ).toBeUndefined();
		} );

		test( 'Should return the list of products containing tsubaki', () => {
			const state = {
				productsList: {
					items,
				},
			};

			const productsBySlug = getProductsByBillingSlug( state, billingSlug );

			expect( productsBySlug[ 0 ] ).toBe( tsubaki );
		} );
	} );
} );
