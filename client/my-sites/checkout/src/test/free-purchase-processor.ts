// @ts-nocheck - TODO: Fix TypeScript issues
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import freePurchaseProcessor from '../lib/free-purchase-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsSuccessResponse,
	processorOptions,
	basicExpectedDomainDetails,
	countryCode,
	postalCode,
	contactDetailsForDomain,
} from './util';

describe( 'freePurchaseProcessor', () => {
	const product = getEmptyResponseCartProduct();
	const domainProduct = {
		...getEmptyResponseCartProduct(),
		meta: 'example.com',
		is_domain_registration: true,
		currency: 'USD',
		item_original_cost_integer: 100,
		item_original_cost_for_quantity_one_integer: 100,
		item_subtotal_integer: 100,
		item_original_subtotal_integer: 100,
		uuid: 'product002',
		cost: 100,
	};
	const cart = { ...getEmptyResponseCart(), products: [ product ] };
	const options = {
		...processorOptions,
		responseCart: cart,
	};

	const basicExpectedStripeRequest = {
		cart: {
			blog_id: 0,
			cart_key: 'no-site',
			coupon: '',
			products: [ product ],
			tax: {
				location: {},
			},
			temporary: false,
		},
		payment: {
			country: '',
			country_code: '',
			name: '',
			payment_method: 'WPCOM_Billing_WPCOM',
			postal_code: '',
			zip: '',
		},
		tos: {
			locale: 'en',
			path: '/',
			viewport: '0x0',
		},
		ad_conversion: {
			ad_details: '',
			sensitive_pixel_options: '',
		},
	};

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			freePurchaseProcessor( {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedStripeRequest );
	} );

	it( 'returns an explicit error response if the transaction fails', async () => {
		mockTransactionsEndpoint( () => [
			400,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
		const expected = { payload: 'test error', type: 'ERROR' };
		await expect(
			freePurchaseProcessor( {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
	} );

	it( 'sends the correct data to the endpoint with a site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			freePurchaseProcessor( {
				...options,
				siteSlug: 'example.wordpress.com',
				siteId: 1234567,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedStripeRequest,
			cart: {
				...basicExpectedStripeRequest.cart,
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with empty tax information if the cart total is 0', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			freePurchaseProcessor( {
				...options,
				siteSlug: 'example.wordpress.com',
				siteId: 1234567,
				contactDetails: {
					countryCode,
					postalCode,
				},
				responseCart: {
					...options.responseCart,
					tax: {
						display_taxes: true,
						location: {
							postal_code: 'pr267ry',
							country_code: 'GB',
						},
					},
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedStripeRequest,
			cart: {
				...basicExpectedStripeRequest.cart,
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information if it is a full-credits purchase', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			freePurchaseProcessor( {
				...options,
				siteSlug: 'example.wordpress.com',
				siteId: 1234567,
				contactDetails: {
					countryCode,
					postalCode,
				},
				responseCart: {
					...options.responseCart,
					products: [ domainProduct ],
					credits_integer: 100,
					sub_total_integer: 100,
					total_tax_integer: 0,
					tax: {
						display_taxes: true,
						location: {
							postal_code: 'pr267ry',
							country_code: 'GB',
						},
					},
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedStripeRequest,
			cart: {
				...basicExpectedStripeRequest.cart,
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
				products: [ domainProduct ],
				tax: { location: { postal_code: 'pr267ry', country_code: 'GB' } },
			},
			payment: {
				...basicExpectedStripeRequest.payment,
				country: 'US',
				country_code: 'US',
				postal_code: '10001',
				zip: '10001',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			freePurchaseProcessor( {
				...options,
				siteSlug: 'example.wordpress.com',
				siteId: 1234567,
				contactDetails: contactDetailsForDomain,
				responseCart: { ...cart, products: [ domainProduct ] },
				includeDomainDetails: true,
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedStripeRequest,
			cart: {
				...basicExpectedStripeRequest.cart,
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
				products: [ domainProduct ],
			},
			domain_details: basicExpectedDomainDetails,
		} );
	} );
} );
