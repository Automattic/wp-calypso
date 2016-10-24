/**
 * External dependencies
 */
var update = require( 'react-addons-update' ),
	i18n = require( 'i18n-calypso' ),
	extend = require( 'lodash/extend' ),
	config = require( 'config' );

/**
 * Internal dependencies
 */
var cartItems = require( './cart-items' ),
	productsValues = require( 'lib/products-values' );

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
			is_coupon_applied: { $set: false }
		} );
	};
}

function canRemoveFromCart( cart, cartItem ) {
	if ( productsValues.isCredits( cartItem ) ) {
		return false;
	}

	if ( cartItems.hasRenewalItem( cart ) && productsValues.isPrivateRegistration( cartItem ) ) {
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
	if ( ! previousCartValue || ! previousCartValue.client_metadata || ! nextCartValue.client_metadata ) {
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
			}
		}
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

function isCreditCardPaymentsEnabled( cart ) {
	return cart.allowed_payment_methods.indexOf( 'WPCOM_Billing_MoneyPress_Paygate' ) >= 0;
}

function isPayPalExpressEnabled( cart ) {
	return config.isEnabled( 'upgrades/paypal' ) &&
			0 <= cart.allowed_payment_methods.indexOf( 'WPCOM_Billing_PayPal_Express' );
}

module.exports = {
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
	isPayPalExpressEnabled,
	isCreditCardPaymentsEnabled
};
