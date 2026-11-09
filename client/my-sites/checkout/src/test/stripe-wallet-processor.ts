// @ts-nocheck - TODO: Fix TypeScript issues
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import stripeWalletProcessor from '../lib/stripe-wallet-processor';
import {
	mockTransactionsEndpoint,
	mockLogStashEndpoint,
	processorOptions,
	countryCode,
	postalCode,
} from './util';

describe( 'stripeWalletProcessor', () => {
	const product = getEmptyResponseCartProduct();
	const cart = { ...getEmptyResponseCart(), products: [ product ] };
	const options = {
		...processorOptions,
		responseCart: cart,
		contactDetails: {
			countryCode,
			postalCode,
		},
	};

	const submitData = {
		elements: {},
		expressPaymentType: 'apple_pay',
	};

	beforeEach( () => {
		mockLogStashEndpoint();
	} );

	it( 'throws an error if there are no elements', async () => {
		await expect(
			stripeWalletProcessor( { expressPaymentType: 'apple_pay' }, options )
		).rejects.toThrow( /Transaction requires Stripe Elements/ );
	} );

	it( 'throws an error if there is no expressPaymentType', async () => {
		await expect( stripeWalletProcessor( { elements: {} }, options ) ).rejects.toThrow(
			/Transaction requires expressPaymentType/
		);
	} );

	it( 'throws an error if there is no stripe object', async () => {
		await expect( stripeWalletProcessor( submitData, options ) ).rejects.toThrow(
			/Stripe is required for stripe-wallet payment/
		);
	} );

	it( 'confirms the payment client-side and returns a success response', async () => {
		mockTransactionsEndpoint( () => [
			200,
			{ order_id: 12345, message: { payment_intent_client_secret: 'test-client-secret' } },
		] );
		const confirmPayment = jest.fn().mockResolvedValue( {} );
		const stripe = { confirmPayment };

		await expect(
			stripeWalletProcessor( submitData, { ...options, stripe } )
		).resolves.toStrictEqual( { payload: { order_id: 12345 }, type: 'SUCCESS' } );

		expect( confirmPayment ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elements: submitData.elements,
				clientSecret: 'test-client-secret',
				redirect: 'if_required',
			} )
		);
	} );

	it( 'returns an explicit error response and records telemetry if the transaction submission fails', async () => {
		mockTransactionsEndpoint( () => [ 400, { error: 'test_error', message: 'test error' } ] );
		const confirmPayment = jest.fn();
		const reduxDispatch = jest.fn();

		await expect(
			stripeWalletProcessor( submitData, { ...options, stripe: { confirmPayment }, reduxDispatch } )
		).resolves.toStrictEqual( { payload: 'test error', type: 'ERROR' } );

		expect( confirmPayment ).not.toHaveBeenCalled();
		expect( reduxDispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				meta: expect.objectContaining( {
					analytics: [
						expect.objectContaining( {
							payload: expect.objectContaining( {
								name: 'calypso_checkout_stripe_wallet_transaction_failed',
								properties: expect.objectContaining( {
									express_payment_type: 'apple_pay',
									error: 'test error',
								} ),
							} ),
						} ),
					],
				} ),
			} )
		);
	} );

	it( 'returns an error response if the server does not return a client secret', async () => {
		mockTransactionsEndpoint( () => [ 200, { order_id: 12345, message: {} } ] );
		const confirmPayment = jest.fn();

		await expect(
			stripeWalletProcessor( submitData, { ...options, stripe: { confirmPayment } } )
		).resolves.toStrictEqual( {
			payload: 'Server did not return a payment intent client secret',
			type: 'ERROR',
		} );
		expect( confirmPayment ).not.toHaveBeenCalled();
	} );

	it( 'returns an error response and records telemetry if stripe.confirmPayment fails', async () => {
		mockTransactionsEndpoint( () => [
			200,
			{ order_id: 12345, message: { payment_intent_client_secret: 'test-client-secret' } },
		] );
		const confirmPayment = jest.fn().mockResolvedValue( {
			error: { message: 'Your card was declined.' },
		} );
		const reduxDispatch = jest.fn();

		await expect(
			stripeWalletProcessor( submitData, {
				...options,
				stripe: { confirmPayment },
				reduxDispatch,
			} )
		).resolves.toStrictEqual( { payload: 'Your card was declined.', type: 'ERROR' } );

		expect( reduxDispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				meta: expect.objectContaining( {
					analytics: [
						expect.objectContaining( {
							payload: expect.objectContaining( {
								name: 'calypso_checkout_stripe_wallet_transaction_failed',
								properties: expect.objectContaining( {
									express_payment_type: 'apple_pay',
									error: 'Your card was declined.',
								} ),
							} ),
						} ),
					],
				} ),
			} )
		);
	} );
} );
