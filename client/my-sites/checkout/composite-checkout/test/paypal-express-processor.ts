/**
 * @jest-environment jsdom
 */

import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import wp from 'calypso/lib/wp';
import payPalExpressProcessor from '../lib/paypal-express-processor';
import {
	processorOptions,
	countryCode,
	postalCode,
	basicExpectedDomainDetails,
	contactDetailsForDomain,
} from './util';

jest.mock( 'calypso/lib/wp' );

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
		cancelUrl: 'https://example.com/',
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
		domainDetails: null,
		postalCode: '',
		successUrl: 'https://example.com',
	};

	const transactionsEndpoint = jest.fn();
	const undocumentedFunctions = {
		paypalExpressUrl: transactionsEndpoint,
	};
	wp.undocumented = jest.fn().mockReturnValue( undocumentedFunctions );

	beforeEach( () => {
		transactionsEndpoint.mockClear();
		transactionsEndpoint.mockReturnValue( Promise.resolve( 'https://test-redirect-url' ) );
	} );

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
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
		transactionsEndpoint.mockReturnValue( Promise.reject( new Error( 'test error' ) ) );
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
			postalCode: 'PR26 7RY',
			country: 'GB',
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
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
			domainDetails: basicExpectedDomainDetails,
		} );
	} );
} );
