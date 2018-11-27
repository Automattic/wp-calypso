/** @format */

/**
 * External dependencies
 */
import url from 'url';
import { extend, isArray, invert } from 'lodash';
import update from 'immutability-helper';
import i18n from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import cartItems from './cart-items';
import productsValues from 'lib/products-values';
import { requestGeoLocation } from 'state/data-getters';

const PAYMENT_METHODS = {
	alipay: 'WPCOM_Billing_Stripe_Source_Alipay',
	bancontact: 'WPCOM_Billing_Stripe_Source_Bancontact',
	'credit-card': 'WPCOM_Billing_MoneyPress_Paygate',
	ebanx: 'WPCOM_Billing_Ebanx',
	'emergent-paywall': 'WPCOM_Billing_Emergent_Paywall',
	eps: 'WPCOM_Billing_Stripe_Source_Eps',
	giropay: 'WPCOM_Billing_Stripe_Source_Giropay',
	ideal: 'WPCOM_Billing_Stripe_Source_Ideal',
	paypal: 'WPCOM_Billing_PayPal_Express',
	p24: 'WPCOM_Billing_Stripe_Source_P24',
	'brazil-tef': 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef',
	wechat: 'WPCOM_Billing_Stripe_Source_Wechat',
	'web-payment': 'WPCOM_Billing_Web_Payment',
};

/**
 * Preprocesses cart for server.
 *
 * @param {Object} cart Cart object.
 * @returns {Object} A new cart object.
 */
function preprocessCartForServer( {
	coupon,
	is_coupon_applied,
	is_coupon_removed,
	currency,
	temporary,
	extra,
	products,
} ) {
	const needsUrlCoupon = ! (
		coupon ||
		is_coupon_applied ||
		is_coupon_removed ||
		typeof document === 'undefined'
	);
	const urlCoupon = needsUrlCoupon ? url.parse( document.URL, true ).query.coupon : '';

	return Object.assign(
		{
			coupon,
			is_coupon_applied,
			is_coupon_removed,
			currency,
			temporary,
			extra,
			products: products.map(
				( { product_id, meta, free_trial, volume, extra: productExtra } ) => ( {
					product_id,
					meta,
					free_trial,
					volume,
					extra: productExtra,
				} )
			),
		},
		needsUrlCoupon &&
			urlCoupon && {
				coupon: urlCoupon,
				is_coupon_applied: false,
			}
	);
}

/**
 * Create a new empty cart.
 *
 * A cart has at least a `blog_id` and an empty list of `products`
 * We can give additional attributes and build new types of empty carts.
 * For instance you may want to create a temporary this way:
 * `emptyCart( 123456, { temporary: true } )`
 *
 * @param {int} [siteId] The Site Id the cart will be associated with
 * @param {Object} [attributes] Additional attributes for the cart (optional)
 * @returns {cart} [emptyCart] The new empty cart created
 */
function emptyCart( siteId, attributes ) {
	return Object.assign( { blog_id: siteId, products: [] }, attributes );
}

function applyCoupon( coupon ) {
	return function( cart ) {
		return update( cart, {
			coupon: { $set: coupon },
			is_coupon_applied: { $set: false },
			$unset: [ 'is_coupon_removed' ],
		} );
	};
}

function removeCoupon() {
	return function( cart ) {
		return update( cart, {
			coupon: { $set: '' },
			is_coupon_applied: { $set: false },
			$merge: { is_coupon_removed: true },
		} );
	};
}

function canRemoveFromCart( cart, cartItem ) {
	if ( productsValues.isCredits( cartItem ) ) {
		return false;
	}

	if (
		cartItems.hasRenewalItem( cart ) &&
		( productsValues.isPrivacyProtection( cartItem ) ||
			productsValues.isDomainRedemption( cartItem ) )
	) {
		return false;
	}

	return true;
}

/**
 * Compare two different cart objects and get the messages of newest one
 *
 * It's possible that we're comparing two carts that have the same server header date.
 * This means the changes only happened locally and the messages returned will be [].
 *
 * @param {cartValue} [previousCartValue] - the previously loaded cart
 * @param {cartValue} [nextCartValue] - the new cart value
 * @returns {array} [nextCartMessages] - an array of messages about the state of the cart
 */
function getNewMessages( previousCartValue, nextCartValue ) {
	let previousDate, nextDate, hasNewServerData, nextCartMessages;
	previousCartValue = previousCartValue || {};
	nextCartValue = nextCartValue || {};
	nextCartMessages = nextCartValue.messages || [];

	// If there is no previous cart then just return the messages for the new cart
	if (
		! previousCartValue ||
		! previousCartValue.client_metadata ||
		! nextCartValue.client_metadata
	) {
		return nextCartMessages;
	}

	previousDate = previousCartValue.client_metadata.last_server_response_date;
	nextDate = nextCartValue.client_metadata.last_server_response_date;
	hasNewServerData = i18n.moment( nextDate ).isAfter( previousDate );

	return hasNewServerData ? nextCartMessages : [];
}

function isPaidForFullyInCredits( cart ) {
	return (
		! cartItems.hasFreeTrial( cart ) &&
		! cartItems.hasProduct( cart, 'wordpress-com-credits' ) &&
		cart.total_cost <= cart.credits &&
		cart.total_cost > 0
	);
}

function isFree( cart ) {
	return cart.total_cost === 0 && ! cartItems.hasFreeTrial( cart );
}

function fillInAllCartItemAttributes( cart, products ) {
	return update( cart, {
		products: {
			$apply: function( items ) {
				return items.map( function( cartItem ) {
					return fillInSingleCartItemAttributes( cartItem, products );
				} );
			},
		},
	} );
}

function fillInSingleCartItemAttributes( cartItem, products ) {
	let product = products[ cartItem.product_slug ],
		attributes = productsValues.whitelistAttributes( product );

	return extend( {}, cartItem, attributes );
}

/**
 * Return a string that represents the overall refund policy for all the items
 * in the shopping cart. See the support documentation for more details on
 * these policies:
 *
 * https://en.support.wordpress.com/refunds/
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {string} the refund policy type
 */
function getRefundPolicy( cart ) {
	if ( cartItems.hasDomainRegistration( cart ) && cartItems.hasPlan( cart ) ) {
		return 'planWithDomainRefund';
	}

	if ( cartItems.hasDomainRegistration( cart ) ) {
		return 'domainRefund';
	}

	return 'genericRefund';
}

function getEnabledPaymentMethods( cart ) {
	// Clone our allowed payment methods array
	let allowedPaymentMethods = cart.allowed_payment_methods.slice( 0 );

	// Ebanx is used as part of the credit-card method, does not need to be listed.
	allowedPaymentMethods = allowedPaymentMethods.filter( function( method ) {
		return 'WPCOM_Billing_Ebanx' !== method;
	} );

	// Invert so we can search by class name.
	const paymentMethodsKeys = invert( PAYMENT_METHODS );

	return allowedPaymentMethods.map( function( methodClassName ) {
		return paymentMethodsKeys[ methodClassName ];
	} );
}

/**
 * Return a string that represents the WPCOM class name for a payment method
 *
 * @param {string} method - payment method
 * @returns {string} the wpcom class name
 */
function paymentMethodClassName( method ) {
	return PAYMENT_METHODS[ method ] || '';
}

/**
 * Return a string that represents the User facing name for payment method
 *
 * @param {string} method - payment method
 * @returns {string} the title
 */
function paymentMethodName( method ) {
	const paymentMethodsNames = {
		alipay: 'Alipay',
		bancontact: 'Bancontact',
		'credit-card': i18n.translate( 'Credit or debit card' ),
		'emergent-paywall': 'Net Banking / Paytm / Debit Card',
		eps: 'EPS',
		giropay: 'Giropay',
		ideal: 'iDEAL',
		paypal: 'PayPal',
		p24: 'Przelewy24',
		'brazil-tef': 'Transferência bancária',
		wechat: i18n.translate( 'WeChat Pay', {
			comment: 'Name for WeChat Pay - https://pay.weixin.qq.com/',
		} ),
		'web-payment': i18n.translate( 'Wallet' ),
	};

	// Temporarily override 'credit or debit' with just 'credit' for india
	// while debit cards are served by the paywall
	if ( method === 'credit-card' ) {
		const userCountryCode = requestGeoLocation().data;
		if ( 'IN' === userCountryCode ) {
			return i18n.translate( 'Credit Card' );
		}
	}

	return paymentMethodsNames[ method ] || method;
}

function isPaymentMethodEnabled( cart, method ) {
	const redirectPaymentMethods = [
		'alipay',
		'bancontact',
		'eps',
		'emergent-paywall',
		'giropay',
		'ideal',
		'paypal',
		'p24',
		'brazil-tef',
		'wechat',
	];
	const methodClassName = paymentMethodClassName( method );

	if ( '' === methodClassName ) {
		return false;
	}

	// Redirect payments might not be possible in some cases - for example in the desktop app
	if (
		redirectPaymentMethods.indexOf( method ) >= 0 &&
		! config.isEnabled( 'upgrades/redirect-payments' )
	) {
		return false;
	}

	return (
		isArray( cart.allowed_payment_methods ) &&
		cart.allowed_payment_methods.indexOf( methodClassName ) >= 0
	);
}

function getLocationOrigin( l ) {
	return l.protocol + '//' + l.hostname + ( l.port ? ':' + l.port : '' );
}

export function hasPendingPayment( cart ) {
	if ( cart && cart.has_pending_payment ) {
		return true;
	}

	return false;
}

export {
	applyCoupon,
	removeCoupon,
	canRemoveFromCart,
	cartItems,
	emptyCart,
	preprocessCartForServer,
	fillInAllCartItemAttributes,
	fillInSingleCartItemAttributes,
	getEnabledPaymentMethods,
	getNewMessages,
	getRefundPolicy,
	isFree,
	isPaidForFullyInCredits,
	isPaymentMethodEnabled,
	paymentMethodClassName,
	paymentMethodName,
	getLocationOrigin,
};

export default {
	applyCoupon,
	removeCoupon,
	cartItems,
	emptyCart,
	isPaymentMethodEnabled,
	hasPendingPayment,
};
