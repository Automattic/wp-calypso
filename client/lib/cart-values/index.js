/** @format */

/**
 * External dependencies
 */
import url from 'url';
import { extend, get, isArray, invert } from 'lodash';
import update, { extend as extendImmutabilityHelper } from 'immutability-helper';
import i18n from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import cartItems from './cart-items';
import { isCredits, isDomainRedemption, whitelistAttributes } from 'lib/products-values';

// Auto-vivification from https://github.com/kolodny/immutability-helper#autovivification
extendImmutabilityHelper( '$auto', function( value, object ) {
	return object ? update( object, value ) : update( {}, value );
} );

// #tax-on-checout-placeholder
import { injectTaxStateWithPlaceholderValues } from 'lib/tax';

const PAYMENT_METHODS = {
	alipay: 'WPCOM_Billing_Stripe_Source_Alipay',
	bancontact: 'WPCOM_Billing_Stripe_Source_Bancontact',
	'credit-card': 'WPCOM_Billing_MoneyPress_Paygate',
	ebanx: 'WPCOM_Billing_Ebanx',
	eps: 'WPCOM_Billing_Stripe_Source_Eps',
	giropay: 'WPCOM_Billing_Stripe_Source_Giropay',
	ideal: 'WPCOM_Billing_Stripe_Source_Ideal',
	paypal: 'WPCOM_Billing_PayPal_Express',
	p24: 'WPCOM_Billing_Stripe_Source_P24',
	'brazil-tef': 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef',
	wechat: 'WPCOM_Billing_Stripe_Source_Wechat',
	'web-payment': 'WPCOM_Billing_Web_Payment',
	sofort: 'WPCOM_Billing_Stripe_Source_Sofort',
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
	tax,
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
			tax: injectTaxStateWithPlaceholderValues( tax ), // #tax-on-checkout-placeholder
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

export const getTaxCountryCode = cart => get( cart, [ 'tax', 'location', 'country_code' ] );

export const getTaxPostalCode = cart => get( cart, [ 'tax', 'location', 'postal_code' ] );

export const getTaxLocation = cart => get( cart, [ 'tax', 'location' ], {} );

function setTaxCountryCode( countryCode ) {
	return function( cart ) {
		return update( cart, {
			$auto: {
				tax: {
					$auto: {
						location: {
							$auto: {
								country_code: {
									$set: countryCode,
								},
							},
						},
					},
				},
			},
		} );
	};
}

function setTaxPostalCode( postalCode ) {
	return function( cart ) {
		return update( cart, {
			$auto: {
				tax: {
					$auto: {
						location: {
							$auto: {
								postal_code: {
									$set: postalCode,
								},
							},
						},
					},
				},
			},
		} );
	};
}

function setTaxLocation( { postalCode, countryCode } ) {
	return function( cart ) {
		return update( cart, {
			$auto: {
				tax: {
					$auto: {
						location: {
							$auto: {
								$set: { postal_code: postalCode, country_code: countryCode },
							},
						},
					},
				},
			},
		} );
	};
}

function canRemoveFromCart( cart, cartItem ) {
	if ( isCredits( cartItem ) ) {
		return false;
	}

	if ( cartItems.hasRenewalItem( cart ) && isDomainRedemption( cartItem ) ) {
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
	previousCartValue = previousCartValue || {};
	nextCartValue = nextCartValue || {};
	const nextCartMessages = nextCartValue.messages || [];

	// If there is no previous cart then just return the messages for the new cart
	if (
		! previousCartValue ||
		! previousCartValue.client_metadata ||
		! nextCartValue.client_metadata
	) {
		return nextCartMessages;
	}

	const previousDate = previousCartValue.client_metadata.last_server_response_date;
	const nextDate = nextCartValue.client_metadata.last_server_response_date;
	const hasNewServerData = i18n.moment( nextDate ).isAfter( previousDate );

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
				return (
					items &&
					items.map( function( cartItem ) {
						return fillInSingleCartItemAttributes( cartItem, products );
					} )
				);
			},
		},
	} );
}

function fillInSingleCartItemAttributes( cartItem, products ) {
	const product = products[ cartItem.product_slug ];
	const attributes = whitelistAttributes( product );

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
		sofort: 'Sofort',
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
		'brazil-tef',
		'wechat',
		'sofort',
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

export function shouldShowTax( cart ) {
	// #tax-on-checkout-placeholder
	if ( ! config.isEnabled( 'show-tax' ) ) {
		return false;
	}

	return get( cart, [ 'tax', 'display_taxes' ], false );
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
	setTaxCountryCode,
	setTaxPostalCode,
	setTaxLocation,
};

export default {
	applyCoupon,
	removeCoupon,
	cartItems,
	emptyCart,
	isPaymentMethodEnabled,
	hasPendingPayment,
};
