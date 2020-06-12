/**
 * External dependencies
 */
import debugFactory from 'debug';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
} from 'my-sites/checkout/composite-checkout/wpcom';
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { recordPurchase } from 'lib/analytics/record-purchase';
import { recordAddEvent } from 'lib/analytics/cart';
import { logToLogstash } from 'state/logstash/actions';
import config from 'config';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout:record-analytics' );

export default function createAnalyticsEventHandler( reduxDispatch ) {
	return function recordEvent( action ) {
		debug( 'heard checkout event', action );
		switch ( action.type ) {
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

			case 'PAYMENT_COMPLETE': {
				const total_cost = action.payload.total.amount.value / 100; // TODO: This conversion only works for USD! We have to localize this or get it from the server directly (or better yet, just force people to use the integer version).

				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_success', {
						coupon_code: action.payload.couponItem?.wpcom_meta.couponCode ?? '',
						currency: action.payload.total.amount.currency,
						payment_method:
							translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
								?.name || '',
						total_cost,
					} )
				);

				const transactionResult = select( 'wpcom' ).getTransactionResult();
				recordPurchase( {
					cart: {
						total_cost,
						currency: action.payload.total.amount.currency,
						is_signup: action.payload.responseCart.is_signup,
						products: action.payload.responseCart.products,
						coupon_code: action.payload.couponItem?.wpcom_meta.couponCode ?? '',
						total_tax: action.payload.responseCart.total_tax,
					},
					orderId: transactionResult.receipt_id,
				} );

				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_complete', {
						redirect_url: action.payload.url,
						coupon_code: action.payload.couponItem?.wpcom_meta.couponCode ?? '',
						total: action.payload.total.amount.value,
						currency: action.payload.total.amount.currency,
						payment_method:
							translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
								?.name || '',
					} )
				);
			}

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
					logStashEventAction( 'step_load', String( action.payload.message ), {
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
				reduxDispatch( logStashEventAction( 'submit_button_load', String( action.payload ) ) );

				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_submit_button_load_error', {
						error_message: String( action.payload ),
					} )
				);

			case 'PAYMENT_METHOD_LOAD_ERROR':
				reduxDispatch( logStashEventAction( 'payment_method_load', String( action.payload ) ) );

				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_method_load_error', {
						error_message: String( action.payload ),
					} )
				);

			case 'PAYMENT_METHOD_SELECT': {
				reduxDispatch(
					logStashEventAction(
						'payment_method_select',
						String( action.payload ),
						{},
						'payment_method_select'
					)
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
				reduxDispatch( logStashEventAction( 'page_load', String( action.payload ) ) );

				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_page_load_error', {
						error_message: String( action.payload ),
					} )
				);

			case 'STORED_CARD_ERROR':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_stored_card_error', {
						error_type: action.payload.type,
						error_message: String( action.payload.message ),
					} )
				);

			case 'CART_ERROR':
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
								translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
									?.name || '',
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
							translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
								?.name || '',
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

			case 'PAYPAL_TRANSACTION_BEGIN': {
				reduxDispatch( recordTracksEvent( 'calypso_checkout_form_redirect', {} ) );
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_paypal_submit_clicked', {} )
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

			default:
				debug( 'unknown checkout event', action );
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_unknown_event', {
						error_type: String( action.type ),
					} )
				);
		}
	};
}

function logStashEventAction( type, payload, additionalData = {}, message ) {
	return logToLogstash( {
		feature: 'calypso_client',
		message: message ?? 'composite checkout load error',
		severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
		extra: {
			env: config( 'env_id' ),
			type,
			message: payload,
			...additionalData,
		},
	} );
}
