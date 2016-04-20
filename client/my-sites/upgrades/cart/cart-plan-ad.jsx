/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { isPlan } from 'lib/products-values';
import * as upgradesActions from 'lib/upgrades/actions';
import { PLAN_PREMIUM } from 'lib/plans/constants';

const CartPlanAd = React.createClass( {
	addToCartAndRedirect( event ) {
		event.preventDefault();
		upgradesActions.addItem( cartItems.premiumPlan( PLAN_PREMIUM, { isFreeTrial: false } ) );
		page( '/checkout/' + this.props.selectedSite.slug );
	},
	shouldDisplayAd() {
		const { cart, selectedSite } = this.props;

		return cart.hasLoadedFromServer &&
			! cartItems.hasDomainCredit( cart ) &&
			cartItems.getDomainRegistrations( cart ).length === 1 &&
			selectedSite.plan &&
			! isPlan( selectedSite.plan );
	},
	render() {
		if ( ! this.shouldDisplayAd() ) {
			return null;
		}

		return (
			<CartAd>
				{
					this.translate( 'Get this domain for free when you upgrade to {{strong}}WordPress.com Premium{{/strong}}!', {
						components: { strong: <strong /> }
					} )
				}
				{ ' ' }
				<a href="" onClick={ this.addToCartAndRedirect }>{ this.translate( 'Upgrade Now' ) }</a>
			</CartAd>
		);
	}
} );

export default CartPlanAd;
