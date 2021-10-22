import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import nock from 'nock';
import genericRedirectProcessor from '../lib/generic-redirect-processor';
import { processorOptions } from './util';

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

	const countryCode = { isTouched: true, value: 'US', errors: [], isRequired: true };
	const postalCode = { isTouched: true, value: '10001', errors: [], isRequired: true };

	const basicExpectedStripeRequest = {
		cart: {
			blog_id: '0',
			cart_key: 'no-site',
			coupon: '',
			create_new_blog: true,
			currency: 'USD',
			extra: [],
			is_jetpack_checkout: false,
			products: [ product ],
			tax: {
				location: {},
			},
			temporary: false,
		},
		domain_details: undefined,
		payment: {
			address: undefined,
			cancel_url: 'https://wordpress.com/',
			city: undefined,
			country: 'US',
			country_code: 'US',
			device_id: undefined,
			document: undefined,
			email: 'test@example.com',
			gstin: undefined,
			ideal_bank: undefined,
			name: 'test name',
			nik: undefined,
			pan: undefined,
			payment_key: undefined,
			payment_method: 'WPCOM_Billing_Stripe_Source_Bancontact',
			payment_partner: 'IE',
			phone_number: undefined,
			postal_code: '10001',
			state: undefined,
			stored_details_id: undefined,
			street_number: undefined,
			success_url:
				'https://wordpress.com/checkout/thank-you/no-site/pending?redirectTo=https%3A%2F%2Fwordpress.com',
			tef_bank: undefined,
			zip: '10001',
		},
	};

	const basicExpectedDomainDetails = {
		address1: undefined,
		address2: undefined,
		alternate_email: undefined,
		city: undefined,
		country_code: 'US',
		email: undefined,
		extra: {
			ca: null,
			fr: null,
			uk: null,
		},
		fax: undefined,
		first_name: undefined,
		last_name: undefined,
		organization: undefined,
		phone: undefined,
		postal_code: '10001',
		state: undefined,
	};

	const transactionsEndpoint = jest.fn();
	const transactionsEndpointResponse = jest.fn();

	beforeEach( () => {
		transactionsEndpoint.mockClear();
		transactionsEndpoint.mockReturnValue( true );
		transactionsEndpointResponse.mockReturnValue( [
			200,
			{ redirect_url: 'https://test-redirect-url' },
		] );
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/transactions', ( body ) => {
				return transactionsEndpoint( body );
			} )
			.reply( transactionsEndpointResponse );
	} );

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
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
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		transactionsEndpointResponse.mockReturnValue( [
			200,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
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
		const submitData = {
			name: 'test name',
			email: 'test@example.com',
		};
		transactionsEndpointResponse.mockReturnValue( [
			400,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
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
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
			},
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=https%3A%2F%2Fwordpress.com',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint a relative thankYouUrl', async () => {
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
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
			},
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=' +
					encodeURIComponent( thankYouUrl ),
			},
		} );
	} );

	it( 'sends the correct data to the endpoint a fully-qualified thankYouUrl', async () => {
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
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
			},
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=' +
					encodeURIComponent( thankYouUrl ),
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information', async () => {
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
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
				tax: { location: { postal_code: 'PR26 7RY', country_code: 'GB' } },
			},
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=https%3A%2F%2Fwordpress.com',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
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
				responseCart: { ...cart, products: [ domainProduct ] },
				includeDomainDetails: true,
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedStripeRequest,
			cart: {
				...basicExpectedStripeRequest.cart,
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
				products: [ domainProduct ],
			},
			domain_details: basicExpectedDomainDetails,
			payment: {
				...basicExpectedStripeRequest.payment,
				success_url:
					'https://wordpress.com/checkout/thank-you/example.wordpress.com/pending?redirectTo=https%3A%2F%2Fwordpress.com',
			},
		} );
	} );
} );
