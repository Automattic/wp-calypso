import { makeErrorResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordTransactionBeginAnalytics, logStashEvent } from './analytics';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

const debug = debugFactory( 'calypso:composite-checkout:vgs-ebanx-processor' );

export const vgsEbanxProcessor = async (
	transactionData: unknown,
	dataForProcessor: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > => {
	if ( ! isValidTransactionData( transactionData ) ) {
		throw new Error( 'Required VGS Ebanx payment data is missing' );
	}

	const { reduxDispatch } = dataForProcessor;

	// Record transaction begin analytics
	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'vgsEbanx' } ) );

	debug( 'processing VGS Ebanx transaction', transactionData );

	try {
		// Submit payment to Ebanx via VGS with enhanced data
		const response = await fetch( '/wp-json/wc/v3/payments/ebanx/process', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
			},
			body: JSON.stringify( transactionData ),
		} );

		if ( ! response.ok ) {
			const errorData = await response.json();
			const errorMessage = errorData.message || 'Payment processing failed';

			// Record analytics for failed transaction
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_vgs_ebanx_transaction_failed', {
					error: errorMessage,
				} )
			);

			logStashEvent(
				'calypso_checkout_vgs_ebanx_transaction_failed',
				{
					error: errorMessage,
				},
				'info'
			);

			return makeErrorResponse( errorMessage );
		}

		const result = await response.json();
		return makeSuccessResponse( result );
	} catch ( error ) {
		debug( 'VGS Ebanx transaction failed', error );

		// Record analytics for failed transaction
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_vgs_ebanx_transaction_failed', {
				error: error instanceof Error ? error.message : 'Payment processing failed',
			} )
		);

		logStashEvent(
			'calypso_checkout_vgs_ebanx_transaction_failed',
			{
				error: error instanceof Error ? error.message : 'Payment processing failed',
			},
			'info'
		);

		return makeErrorResponse(
			error instanceof Error ? error.message : 'Payment processing failed'
		);
	}
};

function isValidTransactionData( submitData: unknown ): submitData is {
	payment_instrument_tokens: string;
	provider_type: string;
	payment_instrument_method: string;
	provider_specific_data: string;
	postal_code?: string;
	country?: string;
} {
	const data = submitData as {
		payment_instrument_tokens: string;
		provider_type: string;
		payment_instrument_method: string;
		provider_specific_data: string;
		postal_code?: string;
		country?: string;
	};

	if ( ! data.payment_instrument_tokens ) {
		throw new Error( 'Transaction requires payment instrument tokens and none was provided' );
	}
	if ( ! data.provider_type ) {
		throw new Error( 'Transaction requires provider type and none was provided' );
	}
	if ( ! data.payment_instrument_method ) {
		throw new Error( 'Transaction requires payment instrument method and none was provided' );
	}
	if ( ! data.provider_specific_data ) {
		throw new Error( 'Transaction requires provider specific data and none was provided' );
	}

	return true;
}
