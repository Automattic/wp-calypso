import config from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { logToLogstash } from 'calypso/lib/logstash';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	isRedirectPaymentMethod,
} from '../lib/translate-payment-method-names';
import type { CheckoutPaymentMethodSlug } from '@automattic/wpcom-checkout';
import type { CalypsoDispatch } from 'calypso/state/types';

function serializeCaughtError(
	// This may come from Error.cause which I'm pretty sure has no defined
	// type. It can be used to keep another Error but it could also be anything
	// else so let's not make any assumptions. Also things other than Error
	// objects can be thrown so let's not even assume this is an Error.
	error: unknown
): string {
	const messages = [];
	messages.push( getErrorMessageFromError( error ) );
	let hasCause = false;
	const errorObject = error as Error;
	if ( 'cause' in errorObject && errorObject.cause ) {
		hasCause = true;
		const cause = serializeCaughtError( errorObject.cause );
		messages.push( `(Cause: ${ cause })` );
	}
	// We only include the stack trace if there is no cause, meaning this is
	// the deepest error in the chain. The others are all likely re-thrown
	// errors so we should know their stack trace already.
	if ( ! hasCause && 'stack' in errorObject && errorObject.stack ) {
		messages.push( `(Stack: ${ errorObject.stack })` );
	}
	return messages.join( '; ' );
}

function getErrorMessageFromError( error: unknown ): string {
	const errorObject = error as Error;
	if ( 'message' in errorObject && errorObject.message ) {
		return `Message: ${ errorObject.message }`;
	}
	return `Non-Error: ${ error }`;
}

/**
 * Convert a thrown error to a string for logging.
 *
 * I've typed this function as requiring an Error because that's the intended
 * behavior and I'd like TypeScript to enforce that as best as it can. However,
 * other things can be thrown besides Error objects and so this will actually
 * handle other things like strings just fine.
 */
export function convertErrorToString( error: Error ): string {
	return serializeCaughtError( error );
}

export function logStashLoadErrorEvent(
	errorType: string,
	error: Error,
	additionalData: Record< string, string | number | undefined > = {}
): Promise< void > {
	captureException( error.cause ? error.cause : error );
	return logStashEvent( 'composite checkout load error', {
		...additionalData,
		type: errorType,
		message: additionalData.message
			? String( additionalData.message )
			: convertErrorToString( error ),
		errorMessage: convertErrorToString( error ),
		tags: [ 'checkout-error-boundary' ],
	} );
}

export type DataForLog = Record< string, string | string[] > & { tags?: string[] };

export function logStashEvent(
	message: string,
	dataForLog: DataForLog,
	severity: 'error' | 'warning' | 'info' = 'error'
): Promise< void > {
	return logToLogstash( {
		feature: 'calypso_client',
		message,
		severity: config( 'env_id' ) === 'production' ? severity : 'debug',
		extra: {
			env: config( 'env_id' ),
			...dataForLog,
		},
		tags: dataForLog.tags ?? [],
	} );
}

export const recordCompositeCheckoutErrorDuringAnalytics =
	( { errorObject, failureDescription }: { errorObject: Error; failureDescription: string } ) =>
	( dispatch: CalypsoDispatch ): void => {
		// This is a fallback to catch any errors caused by the analytics code
		// Anything in this block should remain very simple and extremely
		// tolerant of any kind of data. It should make no assumptions about
		// the data it uses. There's no fallback for the fallback!
		dispatch(
			recordTracksEvent( 'calypso_checkout_composite_error', {
				error_message: ( errorObject as Error ).message,
				action_type: failureDescription,
			} )
		);
		logStashLoadErrorEvent( 'calypso_checkout_composite_error', errorObject, {
			action_type: failureDescription,
		} );
	};

export const recordTransactionBeginAnalytics =
	( {
		paymentMethodId,
		useForAllSubscriptions,
	}: {
		paymentMethodId: CheckoutPaymentMethodSlug;
		useForAllSubscriptions?: boolean;
	} ) =>
	( dispatch: CalypsoDispatch ): void => {
		try {
			if ( isRedirectPaymentMethod( paymentMethodId ) ) {
				dispatch( recordTracksEvent( 'calypso_checkout_form_redirect', {} ) );
			}
			dispatch(
				recordTracksEvent( 'calypso_checkout_form_submit', {
					credits: null,
					payment_method:
						translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ) || '',
					...( useForAllSubscriptions ? { use_for_all_subs: useForAllSubscriptions } : undefined ),
				} )
			);
			dispatch(
				recordTracksEvent( 'calypso_checkout_composite_form_submit', {
					credits: null,
					payment_method:
						translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ) || '',
					...( useForAllSubscriptions ? { use_for_all_subs: useForAllSubscriptions } : undefined ),
				} )
			);
			const paymentMethodIdForTracks = paymentMethodId.startsWith( 'existingCard' )
				? 'existing_card'
				: paymentMethodId.replace( /-/, '_' ).toLowerCase();
			dispatch(
				recordTracksEvent(
					`calypso_checkout_composite_${ paymentMethodIdForTracks }_submit_clicked`,
					{}
				)
			);
		} catch ( errorObject ) {
			dispatch(
				recordCompositeCheckoutErrorDuringAnalytics( {
					errorObject: errorObject as Error,
					failureDescription: `transaction-begin: ${ paymentMethodId }`,
				} )
			);
		}
	};
