/**
 * External dependencies
 */
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import multiPartnerCardProcessor from '../lib/multi-partner-card-processor';
import wp from 'calypso/lib/wp';
import { createEbanxToken } from 'calypso/lib/store-transactions';

jest.mock( 'calypso/lib/wp' );
jest.mock( 'calypso/lib/store-transactions', () => ( {
	createEbanxToken: jest.fn(),
} ) );

async function createMockStripeToken(
	type: string,
	args: { billing_details: Record< string, unknown > }
) {
	if ( type !== 'card' ) {
		return { error: new Error( 'stripe error: unknown type' ) };
	}
	if ( ! args.billing_details ) {
		return { error: new Error( 'stripe error: missing billing_details' ) };
	}
	if ( ! args.billing_details.name ) {
		return { error: new Error( 'stripe error: missing billing_details.name' ) };
	}
	if ( ! args.billing_details.address ) {
		return { error: new Error( 'stripe error: missing billing_details.address' ) };
	}
	if ( ! ( args.billing_details.address as Record< string, string > )?.country ) {
		return { error: new Error( 'stripe error: missing billing_details.address.country' ) };
	}
	if ( ! ( args.billing_details.address as Record< string, string > )?.postal_code ) {
		return { error: new Error( 'stripe error: missing billing_details.address.postal_code' ) };
	}
	return { paymentMethod: { id: 'stripe-token' } };
}

async function createMockEbanxToken( requestType: string, cardDetails: Record< string, string > ) {
	if ( requestType !== 'new_purchase' ) {
		throw new Error( 'ebanx error: invalid requestType' );
	}
	if ( ! cardDetails.country ) {
		throw new Error( 'ebanx error: missing country' );
	}
	if ( ! cardDetails.name ) {
		throw new Error( 'ebanx error: missing name' );
	}
	if ( ! cardDetails.number ) {
		throw new Error( 'ebanx error: missing number' );
	}
	if ( ! cardDetails.cvv ) {
		throw new Error( 'ebanx error: missing cvv' );
	}
	if ( ! cardDetails[ 'expiration-date' ] ) {
		throw new Error( 'ebanx error: missing expiration-date' );
	}
	return {
		deviceId: 'mock-ebanx-device',
		token: 'ebanx-token',
	};
}

describe( 'multiPartnerCardProcessor', () => {
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
	const stripe = {
		createPaymentMethod: createMockStripeToken,
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
			paymentMethod: 'WPCOM_Billing_Stripe_Payment_Method',
			paymentPartner: 'IE',
			phoneNumber: undefined,
			postalCode: '10001',
			state: undefined,
			storedDetailsId: undefined,
			streetNumber: undefined,
			successUrl: undefined,
			tefBank: undefined,
			zip: '10001',
		},
	};

	const basicExpectedEbanxRequest = {
		...basicExpectedStripeRequest,
		payment: {
			address: '100 Main Street',
			cancelUrl: undefined,
			city: 'New York',
			country: 'US',
			countryCode: 'US',
			deviceId: 'mock-ebanx-device',
			document: 'ebanx-document-code',
			email: undefined,
			gstin: undefined,
			idealBank: undefined,
			name: 'test name',
			nik: undefined,
			pan: undefined,
			paymentKey: 'ebanx-token',
			paymentMethod: 'WPCOM_Billing_Ebanx',
			paymentPartner: undefined,
			phoneNumber: '1111111111',
			postalCode: '10001',
			state: 'NY',
			storedDetailsId: undefined,
			streetNumber: '100',
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
		transactionsEndpoint.mockReturnValue( Promise.resolve( 'test success' ) );
	} );

	it( 'throws an error if there is no paymentPartner', async () => {
		const submitData = {};
		await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
			/paymentPartner/
		);
	} );

	it( 'throws an error if there is an unknown paymentPartner', async () => {
		const submitData = { paymentPartner: 'unknown' };
		await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
			/Unrecognized card payment partner/
		);
	} );

	describe( 'for a stripe paymentPartner', () => {
		it( 'throws an error if there is no stripe object', async () => {
			const submitData = { paymentPartner: 'stripe' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/requires stripe and none was provided/
			);
		} );

		it( 'throws an error if there is no stripeConfiguration object', async () => {
			const submitData = { paymentPartner: 'stripe', stripe };
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/requires stripeConfiguration and none was provided/
			);
		} );

		it( 'fails to create a token if the name and address are missing', async () => {
			const submitData = { paymentPartner: 'stripe', stripe, stripeConfiguration };
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/billing_details.name/
			);
		} );

		it( 'fails to create a token if the countryCode and postalCode are missing', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/billing_details.address.country/
			);
		} );

		it( 'fails to create a token if the postalCode is missing', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
			};
			await expect(
				multiPartnerCardProcessor( submitData, {
					...options,
					contactDetails: { countryCode },
				} )
			).rejects.toThrowError( /billing_details.address.postal_code/ );
		} );

		it( 'sends the correct data to the endpoint with no site and one product', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
			};
			const expected = { payload: 'test success', type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
			};
			transactionsEndpoint.mockReturnValue( Promise.reject( new Error( 'test error' ) ) );
			const expected = { payload: 'test error', type: 'ERROR' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
			};
			const expected = { payload: 'test success', type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
			};
			const expected = { payload: 'test success', type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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

	describe( 'for a ebanx paymentPartner', () => {
		const ebanxCardTransactionRequest = {
			name: 'test name',
			countryCode: 'US',
			number: '4242424242424242',
			cvv: '222',
			'expiration-date': '02/22',
			state: 'NY',
			city: 'New York',
			postalCode: '10001',
			address: '100 Main Street',
			streetNumber: '100',
			phoneNumber: '1111111111',
			document: 'ebanx-document-code',
		};
		createEbanxToken.mockImplementation( createMockEbanxToken );

		it( 'throws an error if there is no countryCode in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				countryCode: undefined,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/missing country/
			);
		} );

		it( 'throws an error if there is no name in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				name: undefined,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/missing name/
			);
		} );

		it( 'throws an error if there is no number in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				number: undefined,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/missing number/
			);
		} );

		it( 'throws an error if there is no cvv in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				cvv: undefined,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/missing cvv/
			);
		} );

		it( 'throws an error if there is no expiration-date in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				'expiration-date': undefined,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrowError(
				/missing expiration-date/
			);
		} );

		it( 'sends the correct data to the endpoint with no site and one product', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: 'test success', type: 'SUCCESS' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
			expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedEbanxRequest );
		} );

		it( 'returns an explicit error response if the transaction fails', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			transactionsEndpoint.mockReturnValue( Promise.reject( new Error( 'test error' ) ) );
			const expected = { payload: 'test error', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'sends the correct data to the endpoint with a site and one product', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: 'test success', type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
				...basicExpectedEbanxRequest,
				cart: {
					...basicExpectedStripeRequest.cart,
					blog_id: '1234567',
					cart_key: '1234567',
					coupon: '',
					create_new_blog: false,
					products: [ product ],
				},
			} );
		} );

		it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: 'test success', type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
				...basicExpectedEbanxRequest,
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
} );
