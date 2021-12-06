import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordCompositeCheckoutErrorDuringAnalytics } from './lib/analytics';

const debug = debugFactory( 'calypso:composite-checkout:record-analytics' );

/**
 * NOTE: This file should not be necessary and should slowly be reduced to
 * nothing. Please try not to add anything new here.
 *
 * If you need to record an event, record it directly rather than sending an
 * action to this handler.
 */
export default function createAnalyticsEventHandler( reduxDispatch ) {
	return function recordEvent( action ) {
		try {
			debug( 'heard checkout event', action );
			switch ( action.type ) {
				case 'STRIPE_TRANSACTION_BEGIN': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
							use_for_all_subs: action.payload?.useForAllSubscriptions,
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
							use_for_all_subs: action.payload?.useForAllSubscriptions,
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_stripe_submit_clicked', {} )
					);
				}
				case 'EBANX_TRANSACTION_BEGIN': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Ebanx',
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Ebanx',
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_stripe_submit_clicked', {} )
					);
				}
				case 'EXISTING_CARD_TRANSACTION_BEGIN': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_MoneyPress_Stored',
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_MoneyPress_Stored',
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_existing_card_submit_clicked', {} )
					);
				}
				default:
					debug( 'unknown checkout event', action );
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_unknown_event', {
							error_type: String( action.type ),
						} )
					);
			}
		} catch ( err ) {
			reduxDispatch(
				recordCompositeCheckoutErrorDuringAnalytics( {
					errorObject: err,
					failureDescription: String( action?.type ) + ':' + String( action?.payload ),
				} )
			);
		}
	};
}
