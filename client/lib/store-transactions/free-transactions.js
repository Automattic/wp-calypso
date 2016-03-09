/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ).undocumented(),
	cartLib = require( 'lib/cart' ),
	cartValues = require( 'lib/cart-values' ),
	cartItems = cartValues.cartItems,
	plans = require( 'lib/plans-list' )();

export function freeTrial( planName, onComplete ) {
	const emptyCart = cartValues.emptyTemporaryCart( this.props.site.ID ),
		planItem = cartItems.getItemForPlan( { product_slug: plans.getSlugFromPath( planName ) }, { isFreeTrial: true } ),
		cart = cartItems.add( planItem )( emptyCart );

	submitFreeTransaction( cart, onComplete )
}

export function submitFreeTransaction( cart, onComplete ) {
	const transaction = {
		cart: cartLib.fillInAllCartItemAttributes( cart ),
		payment: { paymentMethod: 'WPCOM_Billing_WPCOM' }
	};

	wpcom.transactions( 'POST', transaction, onComplete );
}
