import debugFactory from 'debug';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
} from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEventAction, recordCompositeCheckoutErrorDuringAnalytics } from './lib/analytics';

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
				case 'PAYMENT_METHOD_SELECT': {
					reduxDispatch(
						logStashEventAction( 'payment_method_select', {
							newMethodId: String( action.payload ),
						} )
					);
					// Need to convert to the slug format used in old checkout so events are comparable
					const rawPaymentMethodSlug = String( action.payload );
					const legacyPaymentMethodSlug = translateCheckoutPaymentMethodToTracksPaymentMethod(
						rawPaymentMethodSlug
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_switch_to_' + legacyPaymentMethodSlug )
					);
				}
				case 'STORED_CARD_ERROR':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_stored_card_error', {
							error_type: action.payload.type,
							error_message: String( action.payload ),
						} )
					);
				case 'CART_ERROR':
					reduxDispatch(
						logStashEventAction( 'calypso_checkout_composite_cart_error', {
							type: action.payload.type,
							message: action.payload.message,
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_cart_error', {
							error_type: action.payload.type,
							error_message: String( action.payload.message ),
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
				case 'a8c_checkout_add_coupon':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_coupon_add_submit', {
							coupon: action.payload.coupon,
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
				case 'a8c_checkout_add_coupon_error':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_coupon_add_error', {
							error_type: action.payload.type,
						} )
					);
				case 'a8c_checkout_add_coupon_button_clicked':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_add_coupon_clicked', {} )
					);
				case 'STEP_NUMBER_CHANGED':
					if ( action.payload.stepNumber === 2 && action.payload.previousStepNumber === 1 ) {
						reduxDispatch(
							recordTracksEvent( 'calypso_checkout_composite_first_step_complete', {
								payment_method:
									translateCheckoutPaymentMethodToWpcomPaymentMethod(
										action.payload.paymentMethodId
									) || '',
							} )
						);
					}
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_step_changed', {
							step: action.payload.stepNumber,
						} )
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
				case 'TRANSACTION_ERROR': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_payment_error', {
							error_code: null,
							reason: String( action.payload.message ),
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_payment_error', {
							error_code: null,
							payment_method:
								translateCheckoutPaymentMethodToWpcomPaymentMethod(
									action.payload.paymentMethodId
								) || '',
							reason: String( action.payload.message ),
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_stripe_transaction_error', {
							error_message: String( action.payload.message ),
						} )
					);
				}
				case 'FREE_TRANSACTION_BEGIN': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_WPCOM',
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_WPCOM',
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_free_purchase_submit_clicked', {} )
					);
				}
				case 'FULL_CREDITS_TRANSACTION_BEGIN': {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_WPCOM',
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_WPCOM',
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_full_credits_submit_clicked', {} )
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
				case 'VALIDATE_DOMAIN_CONTACT_INFO': {
					// TODO: Decide what to do here
					return;
				}
				case 'SHOW_MODAL_AUTHORIZATION': {
					return reduxDispatch( recordTracksEvent( 'calypso_checkout_modal_authorization', {} ) );
				}
				case 'calypso_checkout_composite_summary_help_click': {
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_summary_help_click' )
					);
				}
				case 'CART_CHANGE_PLAN_LENGTH': {
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_plan_length_change', {
							new_product_slug: action.payload?.newProductSlug,
						} )
					);
				}
				case 'THANK_YOU_URL_GENERATED':
					return reduxDispatch(
						logStashEventAction( 'thank you url generated', {
							url: action.payload.url,
						} )
					);
				case 'EMPTY_CART_CTA_CLICKED':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_empty_cart_clicked' )
					);
				default:
					debug( 'unknown checkout event', action );
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_unknown_event', {
							error_type: String( action.type ),
						} )
					);
			}
		} catch ( err ) {
			recordCompositeCheckoutErrorDuringAnalytics( {
				reduxDispatch,
				errorObject: err,
				failureDescription: String( action?.type ) + ':' + String( action?.payload ),
			} );
		}
	};
}
