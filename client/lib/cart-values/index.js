/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	i18n = require( 'lib/mixins/i18n' ),
	extend = require( 'lodash/object/extend' );

/**
 * Internal dependencies
 */
var cartItems = require( './cart-items' ),
	productsValues = require( 'lib/products-values' );

function emptyCart( siteID ) {
	return { blog_id: siteID, products: [] };
}

function applyCoupon( coupon ) {
	return function( cart ) {
		return React.addons.update( cart, {
			coupon: { $set: coupon },
			is_coupon_applied: { $set: false }
		} );
	};
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
	return React.addons.update( cart, {
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

function isPayPalExpressEnabled( cart ) {
	return cart.allowed_payment_methods.indexOf( 'WPCOM_Billing_PayPal_Express' ) >= 0;
}

module.exports = {
	applyCoupon,
	cartItems,
	fillInAllCartItemAttributes,
	fillInSingleCartItemAttributes,
	getNewMessages,
	getRefundPolicy,
	isFree,
	isPaidForFullyInCredits,
	isPayPalExpressEnabled,
	emptyCart
};
