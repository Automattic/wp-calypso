/**
 * External dependencies
 */
import debugFactory from 'debug';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { hasFreeTrial, getDomainRegistrations } from 'calypso/lib/cart-values/cart-items';
import { getTld } from 'calypso/lib/domains';
import {
	INPUT_VALIDATION,
	MODAL_AUTHORIZATION,
	RECEIVED_AUTHORIZATION_RESPONSE,
	REDIRECTING_FOR_AUTHORIZATION,
	RECEIVED_WPCOM_RESPONSE,
} from 'calypso/lib/store-transactions/step-types';

const debug = debugFactory( 'calypso:checkout:payment' );

function formatError( error ) {
	let formattedMessage = '';

	if ( typeof error.message === 'object' ) {
		formattedMessage += Object.keys( error.message ).join( ', ' );
	} else if ( typeof error.message === 'string' ) {
		formattedMessage += error.message;
	}

	if ( error.error ) {
		formattedMessage = error.error + ': ' + formattedMessage;
	}

	if ( error.decline_code ) {
		formattedMessage = error.decline_code + ': ' + formattedMessage;
	}

	if ( error.code ) {
		formattedMessage = error.code + ': ' + formattedMessage;
	}

	return formattedMessage;
}

function recordDomainRegistrationAnalytics( { cart, success } ) {
	for ( const cartItem of getDomainRegistrations( cart ) ) {
		gaRecordEvent( 'Checkout', 'calypso_domain_registration', cartItem.meta );

		recordTracksEvent( 'calypso_domain_registration', {
			domain_name: cartItem.meta,
			domain_tld: getTld( cartItem.meta ),
			success: success,
		} );
	}
}

export function recordTransactionAnalytics( cart, step, paymentMethod ) {
	switch ( step.name ) {
		case INPUT_VALIDATION:
			if ( step.error ) {
				recordTracksEvent( 'calypso_checkout_payment_error', {
					error_code: step.error.error,
					reason: step.error.code,
				} );
			} else {
				recordTracksEvent( 'calypso_checkout_form_submit', {
					credits: cart.credits,
					payment_method: paymentMethod,
				} );
			}
			break;

		case MODAL_AUTHORIZATION:
			recordTracksEvent( 'calypso_checkout_modal_authorization' );
			break;

		case REDIRECTING_FOR_AUTHORIZATION:
			// TODO: wire in payment method
			recordTracksEvent( 'calypso_checkout_form_redirect' );
			break;

		case RECEIVED_AUTHORIZATION_RESPONSE:
		case RECEIVED_WPCOM_RESPONSE:
			if ( step.error ) {
				debug( 'authorization error', step.error );
				recordTracksEvent( 'calypso_checkout_payment_error', {
					error_code: step.error.code || step.error.error,
					reason: formatError( step.error ),
				} );

				recordDomainRegistrationAnalytics( { cart, success: false } );
			} else if ( step.data ) {
				// Makes sure free trials are not recorded as purchases in ad trackers since they are products with
				// zero-value cost and would thus lead to a wrong computation of conversions
				if ( ! hasFreeTrial( cart ) ) {
					recordPurchase( { cart, orderId: step.data.receipt_id } );
				}

				recordTracksEvent( 'calypso_checkout_payment_success', {
					coupon_code: cart.coupon,
					currency: cart.currency,
					payment_method: paymentMethod,
					total_cost: cart.total_cost,
				} );

				for ( const product of cart.products ) {
					recordTracksEvent( 'calypso_checkout_product_purchase', omit( product, 'extra' ) );
				}

				recordDomainRegistrationAnalytics( { cart, success: true } );
			}
			break;

		default:
			if ( step.error ) {
				recordTracksEvent( 'calypso_checkout_payment_error', {
					error_code: step.error.error,
					reason: formatError( step.error ),
				} );
			}
	}
}
