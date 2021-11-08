/**
 * @jest-environment jsdom
 */

import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import payPalExpressProcessor from '../lib/paypal-express-processor';
import {
	mockPayPalEndpoint,
	mockPayPalRedirectResponse,
	processorOptions,
	basicExpectedDomainDetails,
	email,
	countryCode,
	postalCode,
	contactDetailsForDomain,
	mockCreateAccountEndpoint,
	expectedCreateAccountRequest,
	mockCreateAccountSiteCreatedResponse,
	mockCreateAccountSiteNotCreatedResponse,
} from './util';

describe( 'payPalExpressProcessor', () => {
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

	const basicExpectedRequest = {
		cancel_url: 'https://example.com/',
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
		country: '',
		domain_details: null,
		postal_code: '',
		success_url: 'https://example.com',
	};

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedRequest );
	} );

	it( 'returns an explicit error response if the transaction fails', async () => {
		mockPayPalEndpoint( () => [
			400,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
		const expected = { payload: 'test error', type: 'ERROR' };
		await expect(
			payPalExpressProcessor( {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
	} );

	it( 'sends the correct data to the endpoint with a site and one product', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
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
			...basicExpectedRequest,
			cart: {
				...basicExpectedRequest.cart,
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
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
			...basicExpectedRequest,
			cart: {
				...basicExpectedRequest.cart,
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
				tax: { location: { postal_code: 'PR26 7RY', country_code: 'GB' } },
			},
			postal_code: 'PR26 7RY',
			country: 'GB',
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
				...options,
				siteSlug: 'example.wordpress.com',
				siteId: 1234567,
				contactDetails: contactDetailsForDomain,
				responseCart: { ...cart, products: [ domainProduct ] },
				includeDomainDetails: true,
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedRequest,
			cart: {
				...basicExpectedRequest.cart,
				blog_id: '1234567',
				cart_key: '1234567',
				coupon: '',
				create_new_blog: false,
				products: [ domainProduct ],
			},
			domain_details: basicExpectedDomainDetails,
		} );
	} );

	it( 'creates an account and site before sending the correct data to the endpoint with no user, no site, and one product', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const createAccountEndpoint = mockCreateAccountEndpoint( mockCreateAccountSiteCreatedResponse );
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
					email,
				},
				createUserAndSiteBeforeTransaction: true,
			} )
		).resolves.toStrictEqual( expected );
		expect( createAccountEndpoint ).toHaveBeenCalledWith( expectedCreateAccountRequest );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedRequest,
			site_id: 1234567,
			cancel_url: 'https://example.com/?cart=no-user',
			cart: {
				...basicExpectedRequest.cart,
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
				create_new_blog: true, // NOTE: I wonder if this is incorrect behavior since the site has been created at this point
			},
		} );
	} );

	it( 'creates an account before sending the correct data with a site creation request to the endpoint with no user, no site, and one product', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const createAccountEndpoint = mockCreateAccountEndpoint(
			mockCreateAccountSiteNotCreatedResponse
		);
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
					email,
				},
				createUserAndSiteBeforeTransaction: true,
			} )
		).resolves.toStrictEqual( expected );
		expect( createAccountEndpoint ).toHaveBeenCalledWith( expectedCreateAccountRequest );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedRequest,
			cancel_url: 'https://example.com/?cart=no-user',
			cart: {
				...basicExpectedRequest.cart,
				blog_id: '0',
				cart_key: 'no-site',
				coupon: '',
				create_new_blog: true,
			},
		} );
	} );

	it( 'creates an account and no site before sending the correct data to the endpoint with no user, a site, and one product', async () => {
		const transactionsEndpoint = mockPayPalEndpoint( mockPayPalRedirectResponse );
		const createAccountEndpoint = mockCreateAccountEndpoint(
			mockCreateAccountSiteNotCreatedResponse
		);
		const expected = { payload: 'https://test-redirect-url', type: 'REDIRECT' };
		await expect(
			payPalExpressProcessor( {
				...options,
				siteId: 1234567,
				createUserAndSiteBeforeTransaction: true,
				contactDetails: {
					countryCode,
					postalCode,
					email,
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( createAccountEndpoint ).toHaveBeenCalledWith( {
			...expectedCreateAccountRequest,
			should_create_site: false,
		} );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedRequest,
			cancel_url: 'https://example.com/?cart=no-user',
			site_id: 1234567,
			cart: {
				...basicExpectedRequest.cart,
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
				create_new_blog: false,
			},
		} );
	} );
} );
