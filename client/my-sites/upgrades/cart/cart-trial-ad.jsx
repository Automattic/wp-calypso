/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { addCurrentPlanToCartAndRedirect, getCurrentPlan, getDayOfTrial } from 'lib/plans';

const CartTrialAd = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	addPlanAndRedirect( event ) {
		event.preventDefault();

		addCurrentPlanToCartAndRedirect( this.props.sitePlans, this.props.selectedSite );
	},

	render() {
		const { cart, sitePlans } = this.props,
			isDataLoading = ! sitePlans.hasLoadedFromServer || ! cart.hasLoadedFromServer,
			currentPlan = getCurrentPlan( sitePlans.data );

		if ( isDataLoading ||
			! currentPlan.freeTrial ||
			cartItems.getDomainRegistrations( cart ).length !== 1 ||
			cartItems.hasPlan( cart ) ) {
			return null;
		}

		return (
			<CartAd>
				{
					i18n.translate( 'You are currently on day %(days)d of your {{strong}}%(planName)s trial{{/strong}}.', {
						components: { strong: <strong /> },
						args: {
							days: getDayOfTrial( currentPlan ),
							planName: currentPlan.productName
						}
					} )
				}
				{ ' ' }
				{
					i18n.translate( 'Get this domain for free when you upgrade.' )
				}
				{ ' ' }
				<a
					href="#"
					onClick={ this.addPlanAndRedirect }>
						{ i18n.translate( 'Upgrade Now' ) }
				</a>
			</CartAd>
		);
	}
} );

export default CartTrialAd;
