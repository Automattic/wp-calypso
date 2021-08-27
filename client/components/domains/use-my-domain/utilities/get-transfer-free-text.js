'use strict';
exports.__esModule = true;
exports.getTransferFreeText = void 0;
/**
 * External dependencies
 */
var i18n_1 = require( '@wordpress/i18n' );
/**
 * Internal dependencies
 */
var cart_items_1 = require( 'calypso/lib/cart-values/cart-items' );
function getTransferFreeText( props ) {
	var siteHasNoPaidPlan = ! props.siteIsOnPaidPlan || props.isSignupStep;
	var x = props.productsList;
	if ( ! x ) {
		return null;
	}
	var domainProductFreeText = null;
	if (
		cart_items_1.isNextDomainFree( props.cart ) ||
		cart_items_1.isDomainBundledWithPlan( props.cart, props.domain )
	) {
		domainProductFreeText = i18n_1.__( 'Free transfer with your plan' );
	} else if ( siteHasNoPaidPlan ) {
		domainProductFreeText = i18n_1.__( 'Included in paid plans' );
	}
	return domainProductFreeText;
}
exports.getTransferFreeText = getTransferFreeText;
