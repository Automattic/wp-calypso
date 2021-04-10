/**
 * External dependencies
 */
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import existingCardProcessor from '../lib/existing-card-processor';
import wp from 'calypso/lib/wp';

jest.mock( 'calypso/lib/wp' );

describe( 'existingCardProcessor', () => {
	const stripeConfiguration = {
		processor_id: 'IE',
		js_url: 'https://stripe-js-url',
		public_key: 'stripe-public-key',
		setup_intent_id: null,
	};
	const product = getEmptyResponseCartProduct();
	const domainProduct = {
		...getEmptyResponseCartProduct(),
		meta: 'example.com',
		is_domain_registration: true,
	};
	const cart = { ...getEmptyResponseCart(), products: [ product ] };
	const options = {
		includeDomainDetails: false,
		includeGSuiteDetails: false,
		createUserAndSiteBeforeTransaction: false,
		stripeConfiguration,
		recordEvent: () => null,
		reduxDispatch: () => null,
		responseCart: cart,
		getThankYouUrl: () => '',
		siteSlug: undefined,
		siteId: undefined,
		contactDetails: undefined,
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
			products: [ product ],
			tax: {
				display_taxes: false,
				location: {},
			},
			temporary: false,
		},
		domainDetails: undefined,
		payment: {
			address: undefined,
			cancelUrl: undefined,
			city: undefined,
			country: 'US',
			countryCode: 'US',
			deviceId: undefined,
			document: undefined,
			email: undefined,
			gstin: undefined,
			idealBank: undefined,
			name: 'test name',
			nik: undefined,
			pan: undefined,
			paymentKey: 'stripe-token',
			paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
			paymentPartner: 'IE',
			phoneNumber: undefined,
			postalCode: '10001',
			state: undefined,
			storedDetailsId: 'stored-details-id',
			streetNumber: undefined,
			successUrl: undefined,
			tefBank: undefined,
			zip: '10001',
		},
	};

	const basicExpectedDomainDetails = {
		address1: undefined,
		address2: undefined,
		alternateEmail: undefined,
		city: undefined,
		countryCode: 'US',
		email: undefined,
		extra: {
			ca: null,
			fr: null,
			uk: null,
		},
		fax: undefined,
		firstName: undefined,
		lastName: undefined,
		organization: undefined,
		phone: undefined,
		postalCode: '10001',
		state: undefined,
	};

	const transactionsEndpoint = jest.fn();
	const undocumentedFunctions = {
		transactions: transactionsEndpoint,
	};
	wp.undocumented = jest.fn().mockReturnValue( undocumentedFunctions );

	beforeEach( () => {
		transactionsEndpoint.mockClear();
		transactionsEndpoint.mockReturnValue( Promise.resolve( 'success' ) );
	} );

	it( 'throws an error if there is no country passed', async () => {
		const submitData = {};
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrowError(
			/requires country code and none was provided/
		);
	} );

	it( 'throws an error if there is no postalCode passed', async () => {
		const submitData = { country: 'US' };
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrowError(
			/requires postal code and none was provided/
		);
	} );

	it( 'throws an error if there is no storedDetailsId passed', async () => {
		const submitData = { country: 'US', postalCode: '10001' };
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrowError(
			/requires saved card information and none was provided/
		);
	} );

	it( 'throws an error if there is no name passed', async () => {
		const submitData = { country: 'US', postalCode: '10001', storedDetailsId: 'stored-details-id' };
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrowError(
			/requires cardholder name and none was provided/
		);
	} );

	it( 'throws an error if there is no paymentMethodToken passed', async () => {
		const submitData = {
			country: 'US',
			postalCode: '10001',
			storedDetailsId: 'stored-details-id',
			name: 'test name',
		};
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrowError(
			/requires a Stripe token and none was provided/
		);
	} );

	it( 'throws an error if there is no paymentPartnerProcessorId passed', async () => {
		const submitData = {
			country: 'US',
			postalCode: '10001',
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
		};
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrowError(
			/requires a processor id and none was provided/
		);
	} );

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const submitData = {
			country: 'US',
			postalCode: '10001',
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'IE',
		};
		const expected = { payload: 'success', type: 'SUCCESS' };
		await expect(
			existingCardProcessor( submitData, {
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
		const submitData = {
			country: 'US',
			postalCode: '10001',
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'IE',
		};
		transactionsEndpoint.mockReturnValue( Promise.reject( new Error( 'test error' ) ) );
		const expected = { payload: 'test error', type: 'ERROR' };
		await expect(
			existingCardProcessor( submitData, {
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
			country: 'US',
			postalCode: '10001',
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'IE',
		};
		const expected = { payload: 'success', type: 'SUCCESS' };
		await expect(
			existingCardProcessor( submitData, {
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
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		const submitData = {
			country: 'US',
			postalCode: '10001',
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'IE',
		};
		const expected = { payload: 'success', type: 'SUCCESS' };
		await expect(
			existingCardProcessor( submitData, {
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
			domainDetails: basicExpectedDomainDetails,
		} );
	} );
} );
