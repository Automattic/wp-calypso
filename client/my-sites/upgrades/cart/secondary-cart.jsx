/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartBody from 'my-sites/upgrades/cart/cart-body';
import CartMessagesMixin from './cart-messages-mixin';
import CartSummaryBar from 'my-sites/upgrades/cart/cart-summary-bar';
import CartPlanAd from './cart-plan-ad';
import CartPlanDiscountAd from './cart-plan-discount-ad';
import Sidebar from 'layout/sidebar';
import observe from 'lib/mixins/data-observe';
import CartBodyLoadingPlaceholder from 'my-sites/upgrades/cart/cart-body/loading-placeholder';

const SecondaryCart = React.createClass( {
	mixins: [ CartMessagesMixin, observe( 'sites' ) ],

	render() {
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

export default localize( SecondaryCart );
