/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CartBody = require( 'my-sites/upgrades/cart/cart-body' ),
	CartMessagesMixin = require( './cart-messages-mixin' ),
	CartSummaryBar = require( 'my-sites/upgrades/cart/cart-summary-bar' ),
	CartPlanAd = require( './cart-plan-ad' ),
	Sidebar = require( 'layout/sidebar' ),
	observe = require( 'lib/mixins/data-observe' ),
	{ abtest } = require( 'lib/abtest' );

var SecondaryCart = React.createClass( {
	mixins: [ CartMessagesMixin, observe( 'sites' ) ],

	cartShouldBeHidden: function() {
		return this.props.cart.hasLoadedFromServer && this.props.cart.products.length === 1 &&
			abtest( 'sidebarOnCheckoutOfOneProduct' ) === 'hidden';
	},

	render: function() {
		var selectedSite = this.props.selectedSite;

		if ( this.cartShouldBeHidden() ) {
			return null;
		}

		return (
			<Sidebar className="secondary-cart">
				<CartSummaryBar additionalClasses="cart-header" />
				<CartPlanAd
					selectedSite={ selectedSite }
					cart={ this.props.cart } />
				<CartBody
					cart={ this.props.cart }
					selectedSite={ selectedSite }
					showCoupon={ true } />
			</Sidebar>
		);
	}
} );

module.exports = SecondaryCart;
