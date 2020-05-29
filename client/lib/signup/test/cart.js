/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import SignupCart from 'lib/signup/cart';

jest.mock( 'lib/wp', () => {
	const undocumentedMock = { getCart: jest.fn(), setCart: jest.fn() };
	return {
		undocumented: () => undocumentedMock,
	};
} );
jest.mock( 'lib/products-list', () => () => ( {
	get: () => ( {
		dotlive_domain: {
			available: true,
			cost: 12,
			cost_display: '$12.00',
			currency_code: 'USD',
			description: '',
			is_domain_registration: true,
			is_privacy_protection_product_purchase_allowed: true,
			price_tier_slug: null,
			price_tier_usage_quantity: null,
			prices: { USD: 12 },
			product_id: 74,
			product_name: '.live Domain Registration',
			product_slug: 'dotlive_domain',
			sale_cost: 12.5,
			tld: 'live',
		},
	} ),
} ) );

describe( '.addToCart()', () => {
	beforeEach( () => {
		wpcom.undocumented().getCart.mockRestore();
		wpcom.undocumented().setCart.mockRestore();
	} );

	test( 'adds the new products to the cart', () => {
		return new Promise( ( done ) => {
			const cartKey = 'siteSlug';
			const newCartItems = [
				{
					is_domain_registration: true,
					meta: 'domain.live',
					product_slug: 'dotlive_domain',
				},
			];
			const newCartData = {};

			const existingCart = {
				products: [
					{
						bill_period: '365',
						cost: 96,
						currency: 'USD',
						extra: { context: 'signup' },
						free_trial: false,
						is_bundled: false,
						is_domain_registration: false,
						is_renewal: false,
						is_sale_coupon_applied: false,
						meta: '',
						product_cost: 96,
						product_cost_display: '$96',
						product_cost_integer: 9600,
						product_id: 1003,
						product_name: 'WordPress.com Premium',
						product_name_en: 'WordPress.com Premium',
						product_slug: 'value_bundle',
						subscription_id: 0,
						volume: 1,
					},
				],
			};

			wpcom
				.undocumented()
				.getCart.mockImplementation( ( key, callback ) => callback( null, existingCart ) );
			wpcom.undocumented().setCart.mockImplementation( ( key, data, callback ) => callback() );

			SignupCart.addToCart( cartKey, newCartItems, newCartData, () => {
				expect( wpcom.undocumented().setCart ).toHaveBeenCalledWith(
					cartKey,
					expect.objectContaining( {
						products: [
							{
								extra: { context: 'signup' },
								free_trial: false,
								meta: '',
								product_id: 1003,
								volume: 1,
							},
							{
								extra: { context: 'signup' },
								free_trial: undefined,
								meta: 'domain.live',
								product_id: 74,
								volume: undefined,
							},
						],
					} ),
					expect.any( Function )
				);
				done();
			} );
		} );
	} );

	test( 'does not allow more than one domain registration at a time', () => {
		return new Promise( ( done ) => {
			const cartKey = 'siteSlug';
			const newCartItems = [
				{
					is_domain_registration: true,
					meta: 'domain.live',
					product_slug: 'dotlive_domain',
				},
			];
			const newCartData = {};

			const existingCart = {
				products: [
					{
						bill_period: '365',
						cost: 15,
						currency: 'USD',
						extra: { context: 'signup' },
						free_trial: false,
						is_bundled: false,
						is_domain_registration: true,
						is_renewal: false,
						is_sale_coupon_applied: false,
						meta: 'existing-domain.live',
						product_cost: 15,
						product_cost_display: '$15',
						product_cost_integer: 1500,
						product_id: 74,
						product_slug: 'dotlive_domain',
						subscription_id: 0,
						volume: 1,
					},
				],
			};

			wpcom
				.undocumented()
				.getCart.mockImplementation( ( key, callback ) => callback( null, existingCart ) );
			wpcom.undocumented().setCart.mockImplementation( ( key, data, callback ) => callback() );

			SignupCart.addToCart( cartKey, newCartItems, newCartData, () => {
				expect( wpcom.undocumented().setCart ).toHaveBeenCalledWith(
					cartKey,
					expect.objectContaining( {
						products: [
							{
								extra: { context: 'signup' },
								free_trial: undefined,
								meta: 'domain.live',
								product_id: 74,
								volume: undefined,
							},
						],
					} ),
					expect.any( Function )
				);
				done();
			} );
		} );
	} );

	test( 'sets the corresponding `newCartData` in the cart', () => {
		return new Promise( ( done ) => {
			const cartKey = 'siteSlug';
			const newCartItems = [];
			const newCartData = {
				createNewSiteData: {
					blog_name: 'blog_name_wordpress_com',
				},
			};

			const existingCart = {
				products: [
					{
						bill_period: '365',
						cost: 96,
						currency: 'USD',
						extra: { context: 'signup' },
						free_trial: false,
						is_bundled: false,
						is_domain_registration: false,
						is_renewal: false,
						is_sale_coupon_applied: false,
						meta: '',
						product_cost: 96,
						product_cost_display: '$96',
						product_cost_integer: 9600,
						product_id: 1003,
						product_name: 'WordPress.com Premium',
						product_name_en: 'WordPress.com Premium',
						product_slug: 'value_bundle',
						subscription_id: 0,
						volume: 1,
					},
				],
			};

			wpcom
				.undocumented()
				.getCart.mockImplementation( ( key, callback ) => callback( null, existingCart ) );
			wpcom.undocumented().setCart.mockImplementation( ( key, data, callback ) => callback() );

			SignupCart.addToCart( cartKey, newCartItems, newCartData, () => {
				expect( wpcom.undocumented().setCart ).toHaveBeenCalledWith(
					cartKey,
					expect.objectContaining( {
						products: [
							{
								extra: { context: 'signup' },
								free_trial: false,
								meta: '',
								product_id: 1003,
								volume: 1,
							},
						],
						new_site_data: newCartData.createNewSiteData,
					} ),
					expect.any( Function )
				);
				done();
			} );
		} );
	} );
} );
