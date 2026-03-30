/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { act, render } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import upiProcessor from '../lib/upi-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsRedirectResponse,
	processorOptions,
	basicExpectedDomainDetails,
	countryCode,
	postalCode,
	contactDetailsForDomain,
	mockOrderEndpoint,
} from './util';

describe( 'upiProcessor', () => {
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

	const submitData = {
		name: 'test name',
		address: '100 Test St',
		streetNumber: '',
		city: 'Test City',
		state: 'CA',
		postalCode: '99999',
		country: 'XX',
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
			address: '100 Test St',
			cancel_url: 'https://example.com/',
			city: 'Test City',
			country: 'US',
			country_code: 'US',
			name: 'test name',
			payment_method: 'WPCOM_Billing_Stripe_Upi',
			payment_partner: 'IE',
			postal_code: '10001',
			state: 'CA',
			street_number: '',
			success_url:
				'https://example.com/checkout/thank-you/no-site/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
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
		// The processor renders the dialog into a div so that div must be
		// present to avoid errors.
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-failure',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		const transactionsEndpoint = mockTransactionsEndpoint( () =>
			mockTransactionsRedirectResponse( orderId )
		);
		const expected = {
			payload: "Sorry, we couldn't process your payment. Please try again later.",
			type: 'ERROR',
		};

		// We have to use `act()` because this changes the DOM async and
		// otherwise we get a bunch of warnings.
		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
						...options,
						contactDetails: {
							countryCode,
							postalCode,
						},
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );

		expect( transactionsEndpoint ).toHaveBeenCalledWith( basicExpectedStripeRequest );
	} );

	it( 'returns an explicit error response if the transaction fails', async () => {
		// The processor renders the dialog into a div so that div must be
		// present to avoid errors.
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		mockTransactionsEndpoint( () => [
			400,
			{
				error: 'test_error',
				message: 'test error',
			},
		] );
		const expected = { payload: 'test error', type: 'ERROR' };

		// We have to use `act()` because this changes the DOM async and
		// otherwise we get a bunch of warnings.
		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
						...options,
						contactDetails: {
							countryCode,
							postalCode,
						},
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one product', async () => {
		// The processor renders the dialog into a div so that div must be
		// present to avoid errors.
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-failure',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		const transactionsEndpoint = mockTransactionsEndpoint( () =>
			mockTransactionsRedirectResponse( orderId )
		);
		const expected = {
			payload: "Sorry, we couldn't process your payment. Please try again later.",
			type: 'ERROR',
		};

		// We have to use `act()` because this changes the DOM async and
		// otherwise we get a bunch of warnings.
		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
						...options,
						siteSlug: 'example.wordpress.com',
						siteId: 1234567,
						contactDetails: {
							countryCode,
							postalCode,
						},
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );

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
					'https://example.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with tax information', async () => {
		// The processor renders the dialog into a div so that div must be
		// present to avoid errors.
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-failure',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		const transactionsEndpoint = mockTransactionsEndpoint( () =>
			mockTransactionsRedirectResponse( orderId )
		);
		const expected = {
			payload: "Sorry, we couldn't process your payment. Please try again later.",
			type: 'ERROR',
		};

		// We have to use `act()` because this changes the DOM async and
		// otherwise we get a bunch of warnings.
		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
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
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );

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
					'https://example.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'sends the correct data to the endpoint with a site and one domain product', async () => {
		// The processor renders the dialog into a div so that div must be
		// present to avoid errors.
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-failure',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		const transactionsEndpoint = mockTransactionsEndpoint( () =>
			mockTransactionsRedirectResponse( orderId )
		);
		const expected = {
			payload: "Sorry, we couldn't process your payment. Please try again later.",
			type: 'ERROR',
		};

		// We have to use `act()` because this changes the DOM async and
		// otherwise we get a bunch of warnings.
		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
						...options,
						siteSlug: 'example.wordpress.com',
						siteId: 1234567,
						contactDetails: contactDetailsForDomain,
						responseCart: { ...cart, products: [ domainProduct ] },
						includeDomainDetails: true,
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );

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
					'https://example.com/checkout/thank-you/example.wordpress.com/pending/:orderId?redirect_to=%2Fthank-you&receiptId=%3AreceiptId',
			},
		} );
	} );

	it( 'redirects to the pending page when payment is confirmed', async () => {
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-confirmed',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		mockTransactionsEndpoint( () => mockTransactionsRedirectResponse( orderId ) );

		const expectedPendingUrl =
			'https://example.com/checkout/thank-you/no-site/pending/54321?redirect_to=%2Fthank-you&receiptId=%3AreceiptId';
		const expected = {
			payload: expectedPendingUrl,
			type: 'REDIRECT',
		};

		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
						...options,
						contactDetails: {
							countryCode,
							postalCode,
						},
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );
	} );

	it( 'returns a success response when the order succeeds', async () => {
		render( createElement( 'div', { className: 'upi-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'success',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		mockTransactionsEndpoint( () => mockTransactionsRedirectResponse( orderId ) );
		const expected = {
			payload: { success: true, order_id: orderId },
			type: 'SUCCESS',
		};

		await act( async () => {
			await expect(
				upiProcessor(
					submitData,
					{
						...options,
						contactDetails: {
							countryCode,
							postalCode,
						},
					},
					translate
				)
			).resolves.toStrictEqual( expected );
		} );
	} );
} );
