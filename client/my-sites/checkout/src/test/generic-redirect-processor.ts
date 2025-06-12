// @ts-nocheck - TODO: Fix TypeScript issues
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import genericRedirectProcessor from '../lib/generic-redirect-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsRedirectResponse,
	processorOptions,
	basicExpectedDomainDetails,
	countryCode,
	postalCode,
	contactDetailsForDomain,
} from './util';

describe( 'genericRedirectProcessor', () => {
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
			cancel_url: 'https://wordpress.com/',
			country: 'US',
			country_code: 'US',
			email: 'test@example.com',
			name: 'test name',
			payment_method: 'WPCOM_Billing_Stripe_Bancontact',
			payment_partner: 'IE',
			postal_code: '10001',
			success_url:
				'https://wordpress.com/checkout/thank-you/no-site/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
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

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedStripeRequest );
	} );

	it( 'returns a generic error response if the transaction fails with a 200 response', async () => {
		mockTransactionsEndpoint( () => [
			200,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'Error during transaction', type: 'ERROR' };
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
	} );

	it( 'returns an explicit error response if the transaction fails with a non-200 response', async () => {
		mockTransactionsEndpoint( () => [
			400,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'test error', type: 'ERROR' };
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
	} );

	it( 'sends the correct data to the endpoint with a site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
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
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint a relative thankYouUrl', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		const thankYouUrl = '/payments?id=5#begin';
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
				...options,
				getThankYouUrl: () => thankYouUrl,
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
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=' +
					encodeURIComponent( thankYouUrl ) +
					'&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint a fully-qualified thankYouUrl', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		const thankYouUrl = 'https://example.com:5000/payments?id=5#begin';
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
				...options,
				getThankYouUrl: () => thankYouUrl,
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
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=' +
					encodeURIComponent( thankYouUrl ) +
					'&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
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
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsRedirectResponse );
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			genericRedirectProcessor( 'bancontact', submitData, {
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
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
			},
		} );
	} );
} );
