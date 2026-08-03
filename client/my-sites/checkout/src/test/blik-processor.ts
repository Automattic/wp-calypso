/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { act, render } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import blikProcessor from '../lib/blik-processor';
import {
	mockTransactionsEndpoint,
	mockTransactionsRedirectResponse,
	processorOptions,
	countryCode,
	postalCode,
	mockOrderEndpoint,
} from './util';

describe( 'blikProcessor', () => {
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

	const submitData = { code: '123456' };

	it( 'returns a success response when the order is payment-confirmed', async () => {
		// The processor renders the dialog into a div so that div must be
		// present to avoid errors.
		render( createElement( 'div', { className: 'blik-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-confirmed',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		mockTransactionsEndpoint( () => mockTransactionsRedirectResponse( orderId ) );

		const expected = {
			payload: { success: true, order_id: orderId },
			type: 'SUCCESS',
		};

		await act( async () => {
			await expect( blikProcessor( submitData, options, translate ) ).resolves.toStrictEqual(
				expected
			);
		} );
	} );

	it( 'returns a success response when the order succeeds', async () => {
		render( createElement( 'div', { className: 'blik-modal-target' } ) );

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
			await expect( blikProcessor( submitData, options, translate ) ).resolves.toStrictEqual(
				expected
			);
		} );
	} );

	it( 'returns an error response when the order fails', async () => {
		render( createElement( 'div', { className: 'blik-modal-target' } ) );

		const orderId = 54321;
		const mockOrderStatus = {
			order_id: orderId,
			user_id: 1234,
			receipt_id: undefined,
			processing_status: 'payment-failure',
		};
		mockOrderEndpoint( orderId, () => [ 200, mockOrderStatus ] );
		mockTransactionsEndpoint( () => mockTransactionsRedirectResponse( orderId ) );

		const expected = {
			payload: 'Payment failed. Please check your account and try again.',
			type: 'ERROR',
		};

		await act( async () => {
			await expect( blikProcessor( submitData, options, translate ) ).resolves.toStrictEqual(
				expected
			);
		} );
	} );
} );
