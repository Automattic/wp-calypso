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
	CartPlanDiscountAd = require( './cart-plan-discount-ad' ),
	Sidebar = require( 'layout/sidebar' ),
	observe = require( 'lib/mixins/data-observe' );
import CartBodyLoadingPlaceholder from 'my-sites/upgrades/cart/cart-body/loading-placeholder';

var SecondaryCart = React.createClass( {
	mixins: [ CartMessagesMixin, observe( 'sites' ) ],

	render: function() {
		const { cart, selectedSite } = this.props;

		if ( ! cart.hasLoadedFromServer ) {
			return (
				<Sidebar className="secondary-cart">
					<CartSummaryBar additionalClasses="cart-header" />
					<CartBodyLoadingPlaceholder />
				</Sidebar>
			);
		}

		return (
			<Sidebar className="secondary-cart">
				<CartSummaryBar additionalClasses="cart-header" />
				<CartPlanAd
					selectedSite={ selectedSite }
					cart={ cart } />
				<CartBody
					cart={ cart }
					selectedSite={ selectedSite }
					showCoupon={ true } />
				<CartPlanDiscountAd
					cart={ cart }
					selectedSite={ selectedSite } />
			</Sidebar>
		);
	}
} );

module.exports = SecondaryCart;
