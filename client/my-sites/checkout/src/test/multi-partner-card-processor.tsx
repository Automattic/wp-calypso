// @ts-nocheck - TODO: Fix TypeScript issues
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { createEbanxToken } from 'calypso/lib/store-transactions';
import multiPartnerCardProcessor from '../lib/multi-partner-card-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsSuccessResponse,
	processorOptions,
	basicExpectedDomainDetails,
	mockCreateAccountEndpoint,
	expectedCreateAccountRequest,
	countryCode,
	postalCode,
	email,
	contactDetailsForDomain,
	mockCreateAccountSiteCreatedResponse,
	mockCreateAccountSiteNotCreatedResponse,
	planWithoutDomain,
	getBasicCart,
	mockLogStashEndpoint,
} from './util';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	Stripe,
	StripeCardNumberElement,
	StripeError,
	PaymentMethod,
} from '@stripe/stripe-js';

jest.mock( 'calypso/lib/store-transactions', () => ( {
	createEbanxToken: jest.fn(),
} ) );

async function createMockStripeToken( {
	type,
	card,
	billing_details,
}: {
	type: 'card';
	card: StripeCardNumberElement;
	billing_details: PaymentMethod.BillingDetails;
} ): Promise< { paymentMethod: PaymentMethod } | { error: StripeError } > {
	const makeError = ( message: string ): StripeError => ( { type: 'card_error', message } );

	if ( type !== 'card' ) {
		return { error: makeError( 'stripe error: unknown type: ' + type ) };
	}
	if ( ! card ) {
		return { error: makeError( 'stripe error: missing card element' ) };
	}
	if ( ! billing_details ) {
		return { error: makeError( 'stripe error: missing billing_details' ) };
	}
	if ( ! billing_details.name ) {
		return { error: makeError( 'stripe error: missing billing_details.name' ) };
	}
	if ( ! billing_details.address ) {
		return { error: makeError( 'stripe error: missing billing_details.address' ) };
	}
	if ( ! billing_details.address?.country ) {
		return { error: makeError( 'stripe error: missing billing_details.address.country' ) };
	}
	if ( ! billing_details.address?.postal_code ) {
		return { error: makeError( 'stripe error: missing billing_details.address.postal_code' ) };
	}
	return {
		paymentMethod: {
			id: 'stripe-token',
			object: 'payment_method',
			billing_details,
			created: 0,
			customer: null,
			livemode: false,
			metadata: {},
			type: 'test',
		},
	};
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
		public_key: 'pk_test_1234567890',
		setup_intent_id: null,
	};
	const product = planWithoutDomain;
	const domainProduct = {
		...getEmptyResponseCartProduct(),
		meta: 'example.com',
		is_domain_registration: true,
	};
	const cart = { ...getBasicCart(), products: [ product ] };

	const mockCardNumberElement = () => <div>mock card number</div>;

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
			payment_key: 'stripe-token',
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

	const basicExpectedEbanxRequest = {
		...basicExpectedStripeRequest,
		payment: {
			address: '100 Main Street',
			cancel_url: undefined,
			city: 'New York',
			country: 'US',
			country_code: 'US',
			device_id: 'mock-ebanx-device',
			document: 'ebanx-document-code',
			email: undefined,
			gstin: undefined,
			ideal_bank: undefined,
			name: 'test name',
			nik: undefined,
			pan: undefined,
			payment_key: 'ebanx-token',
			payment_method: 'WPCOM_Billing_Ebanx',
			payment_partner: undefined,
			phone_number: '1111111111',
			postal_code: '10001',
			state: 'NY',
			stored_details_id: undefined,
			street_number: '100',
			success_url: undefined,
			tef_bank: undefined,
			zip: '10001',
		},
	};

	const stripe = {
		createPaymentMethod: createMockStripeToken,
	} as Stripe;

	const options: PaymentProcessorOptions = {
		...processorOptions,
		stripe,
		stripeConfiguration,
		responseCart: cart,
	};

	beforeEach( () => {
		mockLogStashEndpoint();
	} );

	it( 'throws an error if there is no paymentPartner', async () => {
		const submitData = {};
		await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrow(
			/paymentPartner/
		);
	} );

	it( 'throws an error if there is an unknown paymentPartner', async () => {
		const submitData = { paymentPartner: 'unknown' };
		await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrow(
			/Unrecognized card payment partner/
		);
	} );

	describe( 'for a stripe paymentPartner', () => {
		it( 'throws an error if there is no stripe object', async () => {
			const submitData = { paymentPartner: 'stripe' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrow(
				/requires stripe and none was provided/
			);
		} );

		it( 'throws an error if there is no stripeConfiguration object', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrow(
				/requires stripeConfiguration and none was provided/
			);
		} );

		it( 'throws an error if there is no cardNumberElement object', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).rejects.toThrow(
				/requires credit card field and none was provided/
			);
		} );

		it( 'fails to create a token if the name and address are missing', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				cardNumberElement: mockCardNumberElement,
			};
			const expected = {
				payload: 'stripe error: missing billing_details.name',
				type: 'ERROR',
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'fails to create a token if the countryCode and postalCode are missing', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = {
				payload: 'stripe error: missing billing_details.address.country',
				type: 'ERROR',
			};
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'fails to create a token if the postalCode is missing', async () => {
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = {
				payload: 'stripe error: missing billing_details.address.postal_code',
				type: 'ERROR',
			};
			await expect(
				multiPartnerCardProcessor( submitData, {
					...options,
					contactDetails: { countryCode },
				} )
			).resolves.toStrictEqual( expected );
		} );

		it( 'sends the correct data to the endpoint with no site and one product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
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

		it( 'creates an account and site before sending the correct data to the endpoint with no user, no site, and one product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const createAccountEndpoint = mockCreateAccountEndpoint(
				mockCreateAccountSiteCreatedResponse
			);
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
					...options,
					createUserAndSiteBeforeTransaction: true,
					contactDetails: {
						email,
						countryCode,
						postalCode,
					},
				} )
			).resolves.toStrictEqual( expected );
			expect( createAccountEndpoint ).toHaveBeenCalledWith( expectedCreateAccountRequest );
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

		it( 'creates an account before sending the correct data with a site creation request to the endpoint with no user, no site, and one product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const createAccountEndpoint = mockCreateAccountEndpoint(
				mockCreateAccountSiteNotCreatedResponse
			);
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
					...options,
					createUserAndSiteBeforeTransaction: true,
					contactDetails: {
						email,
						countryCode,
						postalCode,
					},
				} )
			).resolves.toStrictEqual( expected );
			expect( createAccountEndpoint ).toHaveBeenCalledWith( expectedCreateAccountRequest );
			expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedStripeRequest );
		} );

		it( 'creates an account and no site before sending the correct data to the endpoint with no user, a site, and one product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const createAccountEndpoint = mockCreateAccountEndpoint(
				mockCreateAccountSiteNotCreatedResponse
			);
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
					...options,
					siteId: 1234567,
					createUserAndSiteBeforeTransaction: true,
					contactDetails: {
						email,
						countryCode,
						postalCode,
					},
				} )
			).resolves.toStrictEqual( expected );
			expect( createAccountEndpoint ).toHaveBeenCalledWith( {
				...expectedCreateAccountRequest,
				should_create_site: false,
			} );
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

		it( 'returns an explicit error response if the transaction fails with a non-200 error', async () => {
			mockTransactionsEndpoint( () => [
				400,
				{
					error: 'test_error',
					message: 'test error',
				},
			] );
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
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
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
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
					blog_id: 1234567,
					cart_key: 1234567,
					coupon: '',
				},
			} );
		} );

		it( 'sends the correct data to the endpoint with tax information', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const submitData = {
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
				paymentPartner: 'stripe',
				stripe,
				stripeConfiguration,
				name: 'test name',
				cardNumberElement: mockCardNumberElement,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
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
			const expected = { payload: 'ebanx error: missing country', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'throws an error if there is no name in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				name: undefined,
			};
			const expected = { payload: 'ebanx error: missing name', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'throws an error if there is no number in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				number: undefined,
			};
			const expected = { payload: 'ebanx error: missing number', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'throws an error if there is no cvv in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				cvv: undefined,
			};
			const expected = { payload: 'ebanx error: missing cvv', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'throws an error if there is no expiration-date in the submitted data', async () => {
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
				'expiration-date': undefined,
			};
			const expected = { payload: 'ebanx error: missing expiration-date', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'sends the correct data to the endpoint with no site and one product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
			expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedEbanxRequest );
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
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: 'test error', type: 'ERROR' };
			await expect( multiPartnerCardProcessor( submitData, options ) ).resolves.toStrictEqual(
				expected
			);
		} );

		it( 'sends the correct data to the endpoint with a site and one product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
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
					blog_id: 1234567,
					cart_key: 1234567,
					coupon: '',
					products: [ product ],
				},
			} );
		} );

		it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
			const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
			const submitData = {
				paymentPartner: 'ebanx',
				...ebanxCardTransactionRequest,
			};
			const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
			await expect(
				multiPartnerCardProcessor( submitData, {
					...options,
					siteSlug: 'example.wordpress.com',
					siteId: 1234567,
					contactDetails: contactDetailsForDomain,
					responseCart: { ...cart, products: [ domainProduct ] },
					includeDomainDetails: true,
				} )
			).resolves.toStrictEqual( expected );
			expect( transactionsEndpoint ).toHaveBeenCalledWith( {
				...basicExpectedEbanxRequest,
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
} );
