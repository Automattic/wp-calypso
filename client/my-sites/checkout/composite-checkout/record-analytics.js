import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEvent, recordCompositeCheckoutErrorDuringAnalytics } from './lib/analytics';

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
				case 'STORED_CARD_ERROR':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_stored_card_error', {
							error_type: action.payload.type,
							error_message: String( action.payload ),
						} )
					);
				case 'a8c_checkout_stripe_field_invalid_error':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_stripe_field_invalid_error', {
							error_type: action.payload.type,
							error_field: action.payload.field,
							error_message: action.payload.message,
						} )
					);
				case 'a8c_checkout_cancel_delete_product':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_cancel_delete_product' )
					);
				case 'a8c_checkout_delete_product':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_delete_product', {
							product_name: action.payload.product_name,
						} )
					);
				case 'a8c_checkout_delete_product_press':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_delete_product_press', {
							product_name: action.payload.product_name,
						} )
					);
				case 'a8c_checkout_add_coupon_button_clicked':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_add_coupon_clicked', {} )
					);
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
				case 'APPLE_PAY_TRANSACTION_BEGIN': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Web_Payment',
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Web_Payment',
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_apple_pay_submit_clicked', {} )
					);
				}
				case 'SHOW_MODAL_AUTHORIZATION': {
					return reduxDispatch( recordTracksEvent( 'calypso_checkout_modal_authorization', {} ) );
				}
				case 'CART_CHANGE_PLAN_LENGTH': {
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_plan_length_change', {
							new_product_slug: action.payload?.newProductSlug,
						} )
					);
				}
				case 'THANK_YOU_URL_GENERATED':
					return logStashEvent( 'thank you url generated', {
						url: action.payload.url,
					} );
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
