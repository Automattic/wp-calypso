/**
 * External dependencies
 */
import debugFactory from 'debug';
import { recordTracksEvent } from 'state/analytics/actions';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'my-sites/checkout/composite-checkout/wpcom';
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout:record-analytics' );

export default function createAnalyticsEventHandler( reduxDispatch ) {
	return function recordEvent( action ) {
		debug( 'heard checkout event', action );
		switch ( action.type ) {
			case 'CHECKOUT_LOADED':
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
				analytics.recordPurchase( {
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
						products: action.payload.products.map( product => product.product_slug ).join( ',' ),
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

			case 'STRIPE_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_transaction_error', {
						error_message: String( action.payload ),
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

			case 'FREE_PURCHASE_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_WPCOM',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_free_purchase_transaction_error', {
						error_message: String( action.payload ),
					} )
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

			case 'PAYPAL_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_paypal_transaction_error', {
						error_message: String( action.payload ),
					} )
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

			case 'FULL_CREDITS_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_WPCOM',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_full_credits_error', {
						error_message: String( action.payload ),
					} )
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

			case 'EXISTING_CARD_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_existing_card_error', {
						error_message: String( action.payload ),
					} )
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

			case 'APPLE_PAY_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_apple_pay_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'VALIDATE_DOMAIN_CONTACT_INFO': {
				// TODO: Decide what to do here
				return;
			}

			case 'SHOW_MODAL_AUTHORIZATION': {
				return reduxDispatch( recordTracksEvent( 'calypso_checkout_modal_authorization', {} ) );
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
