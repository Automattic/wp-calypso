/**
 * External dependencies
 */
import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
} from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';

/**
 * Internal dependencies
 */
import { recordAddEvent } from 'calypso/lib/analytics/cart';
import {
	logStashLoadErrorEventAction,
	logStashEventAction,
	recordCompositeCheckoutErrorDuringAnalytics,
} from './lib/analytics';

const debug = debugFactory( 'calypso:composite-checkout:record-analytics' );

export default function createAnalyticsEventHandler( reduxDispatch ) {
	return function recordEvent( action ) {
		try {
			debug( 'heard checkout event', action );
			switch ( action.type ) {
				case 'PRODUCTS_ADD_ERROR':
					reduxDispatch(
						logStashEventAction( 'calypso_composite_checkout_products_load_error', {
							error_message: String( action.payload ),
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_products_load_error', {
							error_message: String( action.payload ),
						} )
					);
				case 'CHECKOUT_LOADED':
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_page_view', {
							saved_cards: action.payload?.saved_cards,
							is_renewal: action.payload?.is_renewal,
							apple_pay_available: action.payload?.apple_pay_available,
							product_slug: action.payload?.product_slug,
							is_composite: true,
						} )
					);
					return reduxDispatch( recordTracksEvent( 'calypso_checkout_composite_loaded', {} ) );
				case 'CART_INIT_COMPLETE':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_cart_loaded', {
							products: action.payload.products
								.map( ( product ) => product.product_slug )
								.join( ',' ),
						} )
					);
				case 'STEP_LOAD_ERROR':
					reduxDispatch(
						logStashLoadErrorEventAction( 'step_load', String( action.payload.message ), {
							stepId: action.payload.stepId,
						} )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_step_load_error', {
							error_message: String( action.payload.message ),
							step_id: String( action.payload.stepId ),
						} )
					);
				case 'SUBMIT_BUTTON_LOAD_ERROR':
					reduxDispatch(
						logStashLoadErrorEventAction( 'submit_button_load', String( action.payload ) )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_submit_button_load_error', {
							error_message: String( action.payload ),
						} )
					);
				case 'PAYMENT_METHOD_LOAD_ERROR':
					reduxDispatch(
						logStashLoadErrorEventAction( 'payment_method_load', String( action.payload ) )
					);
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_payment_method_load_error', {
							error_message: String( action.payload ),
						} )
					);
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
				case 'PAGE_LOAD_ERROR':
					reduxDispatch( logStashLoadErrorEventAction( 'page_load', String( action.payload ) ) );
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_page_load_error', {
							error_message: String( action.payload ),
						} )
					);
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
						} )
					);
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_form_submit', {
							credits: null,
							payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
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
				case 'APPLE_PAY_LOADING_ERROR':
					return reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_apple_pay_error', {
							error_message: String( action.payload ),
							is_loading_error: true,
						} )
					);
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
				case 'CART_ADD_ITEM': {
					return recordAddEvent( action.payload );
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
