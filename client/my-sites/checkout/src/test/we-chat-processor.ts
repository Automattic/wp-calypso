/**
 * @jest-environment jsdom
 */

import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import weChatProcessor from '../lib/we-chat-processor';
import { PaymentProcessorOptions } from '../types/payment-processors';
import {
	mockTransactionsEndpoint,
	mockTransactionsRedirectResponse,
	processorOptions,
	basicExpectedDomainDetails,
	countryCode,
	postalCode,
	contactDetailsForDomain,
} from './util';

describe( 'weChatProcessor', () => {
	const product = getEmptyResponseCartProduct();
	const domainProduct = {
		...getEmptyResponseCartProduct(),
		meta: 'example.com',
		is_domain_registration: true,
	};
	const cart = { ...getEmptyResponseCart(), products: [ product ] };
	const reloadCart = jest.fn();
	const options: PaymentProcessorOptions = {
		...processorOptions,
		responseCart: cart,
		reloadCart,
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
			cancel_url: 'https://example.com/',
			country: 'US',
			country_code: 'US',
			name: 'test name',
			payment_method: 'WPCOM_Billing_Stripe_Source_Wechat',
			payment_partner: 'IE',
			postal_code: '10001',
			success_url:
				'https://example.com/checkout/thank-you/no-site/pending?redirectTo=https%3A%2F%2Fexample.com%2Fthank-you',
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

	const redirect_url = 'https://test-redirect-url';

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
		};
		const expected = { payload: { redirect_url }, type: 'MANUAL' };
		await expect(
			weChatProcessor( submitData, {
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
			name: 'test name',
		};
		const expected = { payload: 'test error', type: 'ERROR' };
		await expect(
			weChatProcessor( submitData, {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
	} );

	it( 'reloads the cart if the transaction fails', async () => {
		mockTransactionsEndpoint( () => [
			400,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
		const submitData = {
			name: 'test name',
		};
		await weChatProcessor( submitData, {
			...options,
			contactDetails: {
				countryCode,
				postalCode,
			},
		} );
		expect( reloadCart ).toHaveBeenCalled();
	} );

	it( 'sends the correct data to the endpoint with a site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
		};
		const expected = { payload: { redirect_url }, type: 'MANUAL' };
		await expect(
			weChatProcessor( submitData, {
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
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://example.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=https%3A%2F%2Fexample.com%2Fthank-you',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
		};
		const expected = { payload: { redirect_url }, type: 'MANUAL' };
		await expect(
			weChatProcessor( submitData, {
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
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://example.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=https%3A%2F%2Fexample.com%2Fthank-you',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
		};
		const expected = { payload: { redirect_url }, type: 'MANUAL' };
		await expect(
			weChatProcessor( submitData, {
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
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://example.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=https%3A%2F%2Fexample.com%2Fthank-you',
			},
		} );
	} );
} );
