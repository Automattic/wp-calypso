/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import CheckoutContainer from './checkout-container';
import CompositeCheckout from './composite-checkout';
import config from 'config';
import CartData from 'components/data/cart';
import { abtest } from 'lib/abtest';

// Decide if we should use CompositeCheckout or CheckoutContainer
export default function CheckoutSystemDecider( {
	product,
	purchaseId,
	selectedFeature,
	couponCode,
	isComingFromSignup,
	plan,
	selectedSite,
	reduxStore,
	redirectTo,
	upgradeIntent,
	clearTransaction,
} ) {
	if ( shouldShowCompositeCheckout() ) {
		return (
			<CartData>
				<CompositeCheckout
					siteSlug={ selectedSite?.slug }
					siteId={ selectedSite?.ID }
					product={ product }
					purchaseId={ purchaseId }
					couponCode={ couponCode }
					redirectTo={ redirectTo }
					feature={ selectedFeature }
				/>
			</CartData>
		);
	}

	return (
		<CheckoutContainer
			product={ product }
			purchaseId={ purchaseId }
			selectedFeature={ selectedFeature }
			couponCode={ couponCode }
			isComingFromSignup={ isComingFromSignup }
			plan={ plan }
			selectedSite={ selectedSite }
			reduxStore={ reduxStore }
			redirectTo={ redirectTo }
			upgradeIntent={ upgradeIntent }
			clearTransaction={ clearTransaction }
		/>
	);
}

function shouldShowCompositeCheckout() {
	if ( ! config.isEnabled( 'composite-checkout-wpcom' ) ) {
		return false;
	}
	// TODO: if a domain product is in the cart, return false
	// TODO: if a non-wpcom product is in the cart, return false
	// TODO: if the language is not en-us, return false
	// TODO: if the geolocation is not in the US, return false
	if ( abtest( 'showCompositeCheckout' ) === 'composite' ) {
		return true;
	}
}
