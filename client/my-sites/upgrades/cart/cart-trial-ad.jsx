/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { getCurrentPlan, getDaysSinceTrialStarted } from 'lib/plans';
import i18n from 'lib/mixins/i18n';
import { addItem } from 'lib/upgrades/actions';

const CartTrialAd = ( { cart, sitePlans, selectedSite } ) => {
	function addToCartAndRedirect( event ) {
		event.preventDefault();

		addItem( cartItems.planItem( getCurrentPlan( sitePlans.data ).productSlug ) );

		page( `/checkout/${ selectedSite.slug }` );
	}

	const isDataLoading = ! sitePlans.hasLoadedFromServer || ! cart.hasLoadedFromServer,
		currentPlan = getCurrentPlan( sitePlans.data );

	if ( isDataLoading ||
		! currentPlan.freeTrial ||
		cartItems.getDomainRegistrations( cart ).length !== 1 ) {
		// we return `<noscript />` here because we can't return null in a stateless component
		// see https://github.com/facebook/react/issues/5355#issuecomment-152949327
		return <noscript />;
	}

	return (
		<div className="popover-cart__cart-trial-ad">
			{
				i18n.translate( 'You are currently on day %(days)d of your {{strong}}%(planName)s trial{{/strong}}.', {
					components: { strong: <strong /> },
					args: {
						days: getDaysSinceTrialStarted( currentPlan ),
						planName: currentPlan.productName
					}
				} )
			}
			{ ' ' }
			{
				i18n.translate( 'Get this domain for free when you upgrade.' )
			}
			{ ' ' }
			<a href="#" onClick={ addToCartAndRedirect }>{ i18n.translate( 'Upgrade Now' ) }</a>
		</div>
	);
};

export default CartTrialAd;
