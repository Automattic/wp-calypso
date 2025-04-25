// @ts-nocheck - TODO: Fix TypeScript issues
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import existingCardProcessor from '../lib/existing-card-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsSuccessResponse,
	processorOptions,
	basicExpectedDomainDetails,
	countryCode,
	postalCode,
	contactDetailsForDomain,
	mockLogStashEndpoint,
} from './util';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { Stripe } from '@stripe/stripe-js';

describe( 'existingCardProcessor', () => {
	const product = getEmptyResponseCartProduct();
	const domainProduct = {
		...getEmptyResponseCartProduct(),
		meta: 'example.com',
		is_domain_registration: true,
	};
	const cart = { ...getEmptyResponseCart(), products: [ product ] };
	const mockConfirmCardPayment = jest
		.fn()
		.mockResolvedValue( { paymentIntent: 'test-payment-intent' } );
	const stripe = {
		confirmCardPayment: mockConfirmCardPayment as Stripe[ 'confirmCardPayment' ],
	} as Stripe;
	const options: PaymentProcessorOptions = {
		...processorOptions,
		stripe,
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
			country: 'US',
			country_code: 'US',
			name: 'test name',
			payment_key: 'stripe-token',
			payment_method: 'WPCOM_Billing_MoneyPress_Stored',
			payment_partner: 'stripe_ie',
			postal_code: '10001',
			stored_details_id: 'stored-details-id',
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

	it( 'throws an error if there is no storedDetailsId passed', async () => {
		const submitData = {};
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrow(
			/requires saved card information and none was provided/
		);
	} );

	it( 'throws an error if there is no paymentMethodToken passed', async () => {
		const submitData = {
			storedDetailsId: 'stored-details-id',
			name: 'test name',
		};
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrow(
			/requires a Stripe token and none was provided/
		);
	} );

	it( 'throws an error if there is no paymentPartnerProcessorId passed', async () => {
		const submitData = {
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
		};
		await expect( existingCardProcessor( submitData, options ) ).rejects.toThrow(
			/requires a processor id and none was provided/
		);
	} );

	it( 'sends the correct data to the endpoint with no site and one product', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'stripe_ie',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
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

	it( 'sends the correct data to the endpoint with no site and one product and no name', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			storedDetailsId: 'stored-details-id',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'stripe_ie',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			existingCardProcessor( submitData, {
				...options,
				contactDetails: {
					countryCode,
					postalCode,
				},
			} )
		).resolves.toStrictEqual( expected );
		expect( transactionsEndpoint ).toHaveBeenCalledWith( {
			...basicExpectedStripeRequest,
			payment: {
				...basicExpectedStripeRequest.payment,
				name: '',
			},
		} );
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
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'stripe_ie',
		};
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
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'stripe_ie',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
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
				blog_id: 1234567,
				cart_key: 1234567,
				coupon: '',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information', async () => {
		const transactionsEndpoint = mockTransactionsEndpoint( mockTransactionsSuccessResponse );
		const submitData = {
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'stripe_ie',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			existingCardProcessor( submitData, {
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
			storedDetailsId: 'stored-details-id',
			name: 'test name',
			paymentMethodToken: 'stripe-token',
			paymentPartnerProcessorId: 'stripe_ie',
		};
		const expected = { payload: { success: 'true' }, type: 'SUCCESS' };
		await expect(
			existingCardProcessor( submitData, {
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
