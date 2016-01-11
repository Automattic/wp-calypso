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
	observe = require( 'lib/mixins/data-observe' );

var SecondaryCart = React.createClass( {
	mixins: [ CartMessagesMixin, observe( 'sites' ) ],

	render: function() {
		var selectedSite = this.props.selectedSite;

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
