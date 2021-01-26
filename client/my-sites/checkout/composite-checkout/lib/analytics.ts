/**
 * External dependencies
 */
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from '@automattic/calypso-config';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	isRedirectPaymentMethod,
} from '../lib/translate-payment-method-names';
import type { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';

export function logStashLoadErrorEventAction(
	errorType: string,
	errorMessage: string,
	additionalData: Record< string, string > = {}
): ReturnType< typeof logToLogstash > {
	return logStashEventAction( 'composite checkout load error', {
		...additionalData,
		type: errorType,
		message: errorMessage,
	} );
}

export function logStashEventAction(
	message: string,
	dataForLog: Record< string, string > = {}
): ReturnType< typeof logToLogstash > {
	return logToLogstash( {
		feature: 'calypso_client',
		message,
		severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
		extra: {
			env: config( 'env_id' ),
			...dataForLog,
		},
	} );
}

export function recordCompositeCheckoutErrorDuringAnalytics( {
	errorObject,
	failureDescription,
	reduxDispatch,
}: {
	errorObject: Error;
	failureDescription: string;
	reduxDispatch: ReturnType< typeof useDispatch >;
} ): void {
	// This is a fallback to catch any errors caused by the analytics code
	// Anything in this block should remain very simple and extremely
	// tolerant of any kind of data. It should make no assumptions about
	// the data it uses. There's no fallback for the fallback!
	reduxDispatch(
		recordTracksEvent( 'calypso_checkout_composite_error', {
			error_message: errorObject.message,
			action_type: failureDescription,
		} )
	);
	reduxDispatch(
		logStashLoadErrorEventAction( 'calypso_checkout_composite_error', errorObject.message, {
			action_type: failureDescription,
		} )
	);
}

export function recordTransactionBeginAnalytics( {
	reduxDispatch,
	paymentMethodId,
}: {
	reduxDispatch: ReturnType< typeof useDispatch >;
	paymentMethodId: CheckoutPaymentMethodSlug;
} ): void {
	try {
		if ( isRedirectPaymentMethod( paymentMethodId ) ) {
			reduxDispatch( recordTracksEvent( 'calypso_checkout_form_redirect', {} ) );
		}
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_form_submit', {
				credits: null,
				payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ) || '',
			} )
		);
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_composite_form_submit', {
				credits: null,
				payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ) || '',
			} )
		);
		const paymentMethodIdForTracks = paymentMethodId.replace( /-/, '_' ).toLowerCase();
		reduxDispatch(
			recordTracksEvent(
				`calypso_checkout_composite_${ paymentMethodIdForTracks }_submit_clicked`,
				{}
			)
		);
	} catch ( errorObject ) {
		recordCompositeCheckoutErrorDuringAnalytics( {
			reduxDispatch,
			errorObject,
			failureDescription: `transaction-begin: ${ paymentMethodId }`,
		} );
	}
}
