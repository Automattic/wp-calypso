/**
 * External dependencies
 */
import url from 'url';
import { extend, get, isArray, invert } from 'lodash';
import update, { extend as extendImmutabilityHelper } from 'immutability-helper';
import { translate } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import {
	hasRenewalItem,
	hasFreeTrial,
	hasProduct,
	hasDomainRegistration,
	hasPlan,
} from './cart-items';
import { isCredits, isDomainRedemption, whitelistAttributes } from 'lib/products-values';
import { detectWebPaymentMethod } from 'lib/web-payment';

// Auto-vivification from https://github.com/kolodny/immutability-helper#autovivification
extendImmutabilityHelper( '$auto', function ( value, object ) {
	return object ? update( object, value ) : update( {}, value );
} );

const PAYMENT_METHODS = {
	alipay: 'WPCOM_Billing_Stripe_Source_Alipay',
	bancontact: 'WPCOM_Billing_Stripe_Source_Bancontact',
	'credit-card': 'WPCOM_Billing_MoneyPress_Paygate',
	ebanx: 'WPCOM_Billing_Ebanx',
	eps: 'WPCOM_Billing_Stripe_Source_Eps',
	giropay: 'WPCOM_Billing_Stripe_Source_Giropay',
	id_wallet: 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet',
	ideal: 'WPCOM_Billing_Stripe_Source_Ideal',
	netbanking: 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking',
	paypal: 'WPCOM_Billing_PayPal_Express',
	p24: 'WPCOM_Billing_Stripe_Source_P24',
	'brazil-tef': 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef',
	wechat: 'WPCOM_Billing_Stripe_Source_Wechat',
	'web-payment': 'WPCOM_Billing_Web_Payment',
	sofort: 'WPCOM_Billing_Stripe_Source_Sofort',
	stripe: 'WPCOM_Billing_Stripe_Payment_Method',
};

/**
 * Preprocesses cart for server.
 *
 * @param {object} cart Cart object.
 * @returns {object} A new cart object.
 */
export function preprocessCartForServer( {
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
			tax,
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
 * @param {number} [siteId] The Site Id the cart will be associated with
 * @param {object} [attributes] Additional attributes for the cart (optional)
 * @returns {object} [emptyCart] The new empty cart created
 */
export function emptyCart( siteId, attributes ) {
	return Object.assign( { blog_id: siteId, products: [] }, attributes );
}

export function applyCoupon( coupon ) {
	return function ( cart ) {
		return update( cart, {
			coupon: { $set: coupon },
			is_coupon_applied: { $set: false },
			$unset: [ 'is_coupon_removed' ],
		} );
	};
}

export function removeCoupon() {
	return function ( cart ) {
		return update( cart, {
			coupon: { $set: '' },
			is_coupon_applied: { $set: false },
			$merge: { is_coupon_removed: true },
		} );
	};
}

export const getTaxCountryCode = ( cart ) => get( cart, [ 'tax', 'location', 'country_code' ] );

export const getTaxPostalCode = ( cart ) => get( cart, [ 'tax', 'location', 'postal_code' ] );

export const getTaxLocation = ( cart ) => get( cart, [ 'tax', 'location' ], {} );

export function setTaxCountryCode( countryCode ) {
	return function ( cart ) {
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

export function setTaxPostalCode( postalCode ) {
	return function ( cart ) {
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

export function setTaxLocation( { postalCode, countryCode } ) {
	return function ( cart ) {
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

export function canRemoveFromCart( cart, cartItem ) {
	if ( isCredits( cartItem ) ) {
		return false;
	}

	if ( hasRenewalItem( cart ) && isDomainRedemption( cartItem ) ) {
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
 * @param {object} [previousCartValue] - the previously loaded cart
 * @param {object} [nextCartValue] - the new cart value
 * @returns {Array} [nextCartMessages] - an array of messages about the state of the cart
 */
export function getNewMessages( previousCartValue, nextCartValue ) {
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
	const hasNewServerData = new Date( nextDate ) > new Date( previousDate );

	return hasNewServerData ? nextCartMessages : [];
}

export function isPaidForFullyInCredits( cart ) {
	return (
		! hasFreeTrial( cart ) &&
		! hasProduct( cart, 'wordpress-com-credits' ) &&
		cart.total_cost <= cart.credits &&
		cart.total_cost > 0
	);
}

export function isFree( cart ) {
	return cart.total_cost === 0 && ! hasFreeTrial( cart );
}

export function fillInAllCartItemAttributes( cart, products ) {
	return update( cart, {
		products: {
			$apply: function ( items ) {
				return (
					items &&
					items.map( function ( cartItem ) {
						return fillInSingleCartItemAttributes( cartItem, products );
					} )
				);
			},
		},
	} );
}

export function fillInSingleCartItemAttributes( cartItem, products ) {
	const product = products[ cartItem.product_slug ];
	const attributes = whitelistAttributes( product );

	return extend( {}, cartItem, attributes );
}

/**
 * Return a string that represents the overall refund policy for all the items
 * in the shopping cart. See the support documentation for more details on
 * these policies:
 *
 * https://wordpress.com/support/refunds/
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {string} the refund policy type
 */
export function getRefundPolicy( cart ) {
	if ( hasDomainRegistration( cart ) && hasPlan( cart ) ) {
		return 'planWithDomainRefund';
	}

	if ( hasDomainRegistration( cart ) ) {
		return 'domainRefund';
	}

	return 'genericRefund';
}

export function getEnabledPaymentMethods( cart ) {
	// Clone our allowed payment methods array
	let allowedPaymentMethods = cart.allowed_payment_methods.slice( 0 );

	// Ebanx is used as part of the credit-card method, does not need to be listed.
	allowedPaymentMethods = allowedPaymentMethods.filter( function ( method ) {
		return 'WPCOM_Billing_Ebanx' !== method;
	} );

	// Stripe Elements is used as part of the credit-card method, does not need to be listed.
	allowedPaymentMethods = allowedPaymentMethods.filter( function ( method ) {
		return 'WPCOM_Billing_Stripe_Payment_Method' !== method;
	} );

	// Web payment methods such as Apple Pay are enabled based on client-side
	// capabilities.
	allowedPaymentMethods = allowedPaymentMethods.filter( function ( method ) {
		return 'WPCOM_Billing_Web_Payment' !== method || null !== detectWebPaymentMethod();
	} );

	// Invert so we can search by class name.
	const paymentMethodsKeys = invert( PAYMENT_METHODS );

	return allowedPaymentMethods.map( function ( methodClassName ) {
		return paymentMethodsKeys[ methodClassName ];
	} );
}

/**
 * Return a string that represents the WPCOM class name for a payment method
 *
 * @param {string} method -  payment method
 * @returns {string} the wpcom class name
 */
export function paymentMethodClassName( method ) {
	return PAYMENT_METHODS[ method ] || '';
}

/**
 * Return a string that represents the User facing name for payment method
 *
 * @param {string} method - payment method
 * @returns {string} the title
 */
export function paymentMethodName( method ) {
	const paymentMethodsNames = {
		alipay: 'Alipay',
		bancontact: 'Bancontact',
		'credit-card': translate( 'Credit or debit card' ),
		eps: 'EPS',
		giropay: 'Giropay',
		id_wallet: 'OVO',
		ideal: 'iDEAL',
		netbanking: 'Net Banking',
		paypal: 'PayPal',
		p24: 'Przelewy24',
		'brazil-tef': 'Transferência bancária',
		// The web-payment method technically supports multiple digital
		// wallets, but only Apple Pay is used for now. To enable other
		// wallets, we'd need to split web-payment up into multiple methods
		// anyway (so that each wallet is a separate payment choice for the
		// user), so it's fine to just hardcode this to "Apple Pay" in the
		// meantime.
		'web-payment': 'Apple Pay',
		wechat: translate( 'WeChat Pay', {
			comment: 'Name for WeChat Pay - https://pay.weixin.qq.com/',
		} ),
		sofort: 'Sofort',
	};

	return paymentMethodsNames[ method ] || method;
}

export function isPaymentMethodEnabled( cart, method ) {
	const redirectPaymentMethods = [
		'alipay',
		'bancontact',
		'eps',
		'giropay',
		'ideal',
		'netbanking',
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

	if ( 'web-payment' === method && null === detectWebPaymentMethod() ) {
		return false;
	}

	return (
		isArray( cart.allowed_payment_methods ) &&
		cart.allowed_payment_methods.indexOf( methodClassName ) >= 0
	);
}

export function getLocationOrigin( l ) {
	return l.protocol + '//' + l.hostname + ( l.port ? ':' + l.port : '' );
}

export function hasPendingPayment( cart ) {
	if ( cart && cart.has_pending_payment ) {
		return true;
	}

	return false;
}

export function shouldShowTax( cart ) {
	return get( cart, [ 'tax', 'display_taxes' ], false );
}
