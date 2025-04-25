// @ts-nocheck - TODO: Fix TypeScript issues
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import webPayProcessor from '../lib/web-pay-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsSuccessResponse,
	processorOptions,
	stripeConfiguration,
	basicExpectedDomainDetails,
	countryCode,
	postalCode,
	contactDetailsForDomain,
	mockLogStashEndpoint,
} from './util';

describe( 'webPayProcessor', () => {
	const product = getEmptyResponseCartProduct();
	const domainProduct = {
		...getEmptyResponseCartProduct(),
		meta: 'example.com',
		is_domain_registration: true,
	};
	const cart = { ...getEmptyResponseCart(), products: [ product ] };
	const options = {
		...processorOptions,
		responseCart: cart,
	};

	const stripe = {};

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
			country: 'US',
			country_code: 'US',
			name: 'test name',
			payment_key: 'web-pay-token',
			payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
			payment_partner: 'IE',
			postal_code: '10001',
			zip: '10001',
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

	beforeEach( () => {
		mockLogStashEndpoint();
	} );

	it( 'throws an error if there is no stripe object', async () => {
		const submitData = { paymentPartner: 'stripe' };
		await expect( webPayProcessor( 'apple-pay', submitData, options ) ).rejects.toThrow(
			/requires stripe and none was provided/
		);
	} );

	it( 'throws an error if there is no stripeConfiguration object', async () => {
		const submitData = { paymentPartner: 'stripe', stripe };
		await expect( webPayProcessor( 'apple-pay', submitData, options ) ).rejects.toThrow(
			/requires stripeConfiguration and none was provided/
		);
	} );

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			stripe,
			stripeConfiguration,
			paymentMethodToken: 'web-pay-token',
			name: 'test name',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			webPayProcessor( 'apple-pay', submitData, {
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
		const submitData = {
			stripe,
			stripeConfiguration,
			paymentMethodToken: 'web-pay-token',
			name: 'test name',
		};
		const expected = { payload: 'test error', type: 'ERROR' };
		await expect(
			webPayProcessor( 'apple-pay', submitData, {
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
		const submitData = {
			stripe,
			stripeConfiguration,
			paymentMethodToken: 'web-pay-token',
			name: 'test name',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			webPayProcessor( 'apple-pay', submitData, {
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

	it( 'sends the correct data to the endpoint with tax information', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			stripe,
			stripeConfiguration,
			paymentMethodToken: 'web-pay-token',
			name: 'test name',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			webPayProcessor( 'apple-pay', submitData, {
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
				tax: { location: { postal_code: 'pr267ry', country_code: 'GB' } },
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			stripe,
			stripeConfiguration,
			paymentMethodToken: 'web-pay-token',
			name: 'test name',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			webPayProcessor( 'apple-pay', submitData, {
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
