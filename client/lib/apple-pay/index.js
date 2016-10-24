/**
 * Internal dependencies
 */
import config from 'config';
import { recordTracksEvent } from 'state/analytics/actions';

const MERCHANT_IDENTIFIER = 'merchant.com.wordpress';

const recordApplePayStatusEvent = canMakePaymentsWithActiveCard => recordTracksEvent( 'calypso_apple_pay_status', {
	can_make_payments_with_active_card: canMakePaymentsWithActiveCard
} );

export const recordApplePayStatus = () => dispatch => {
	if ( ! config.isEnabled( 'apple-pay' ) ) {
		return;
	}

	if ( typeof window === 'undefined' || ! window.ApplePaySession ) {
		dispatch( recordApplePayStatusEvent( false ) );
		return;
	}

	window.ApplePaySession.canMakePaymentsWithActiveCard( MERCHANT_IDENTIFIER )
		.then( canMakePaymentsWithActiveCard => dispatch( recordApplePayStatusEvent( canMakePaymentsWithActiveCard ) ) )
		.catch( () => dispatch( recordApplePayStatusEvent( false ) ) );
};
