/** @format */

/**
 * External dependencies
 */

import { extend, isArray } from 'lodash';
import update from 'immutability-helper';
import i18n from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import cartItems from './cart-items';
import productsValues from 'lib/products-values';

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
	var previousDate, nextDate, hasNewServerData, nextCartMessages;
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
	var product = products[ cartItem.product_slug ],
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

/**
 * Return a string that represents the WPCOM class name for a payment method
 *
 * @param {string} method - payment method
 * @returns {string} the wpcom class name
 */
function paymentMethodClassName( method ) {
	const paymentMethodsClassNames = {
		alipay: 'WPCOM_Billing_Stripe_Source_Alipay',
		bancontact: 'WPCOM_Billing_Stripe_Source_Bancontact',
		'credit-card': 'WPCOM_Billing_MoneyPress_Paygate',
		ebanx: 'WPCOM_Billing_Ebanx',
		eps: 'WPCOM_Billing_Stripe_Source_Eps',
		giropay: 'WPCOM_Billing_Stripe_Source_Giropay',
		ideal: 'WPCOM_Billing_Stripe_Source_Ideal',
		paypal: 'WPCOM_Billing_PayPal_Express',
		p24: 'WPCOM_Billing_Stripe_Source_P24',
	};

	return paymentMethodsClassNames[ method ] || '';
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
		eps: 'EPS',
		giropay: 'Giropay',
		ideal: 'iDEAL',
		paypal: 'PayPal',
		p24: 'Przelewy24',
	};

	return paymentMethodsNames[ method ] || method;
}

function isPaymentMethodEnabled( cart, method ) {
	const redirectPaymentMethods = [
		'alipay',
		'bancontact',
		'eps',
		'giropay',
		'ideal',
		'paypal',
		'p24',
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

export {
	applyCoupon,
	canRemoveFromCart,
	cartItems,
	emptyCart,
	fillInAllCartItemAttributes,
	fillInSingleCartItemAttributes,
	getNewMessages,
	getRefundPolicy,
	isFree,
	isPaidForFullyInCredits,
	isPaymentMethodEnabled,
	paymentMethodClassName,
	paymentMethodName,
};

export default {
	applyCoupon,
	cartItems,
	emptyCart,
	isPaymentMethodEnabled,
};
