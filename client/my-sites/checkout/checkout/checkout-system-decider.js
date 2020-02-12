/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import CheckoutContainer from './checkout-container';
import CompositeCheckout from './composite-checkout';
import config from 'config';
import { abtest } from 'lib/abtest';
import { getCurrentUserLocale, getCurrentUserCountryCode } from 'state/current-user/selectors';

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
	cart,
} ) {
	const countryCode = useSelector( state => getCurrentUserCountryCode( state ) );
	const locale = useSelector( state => getCurrentUserLocale( state ) );

	if ( shouldShowCompositeCheckout( cart, countryCode, locale ) ) {
		return (
			<CompositeCheckout
				siteSlug={ selectedSite?.slug }
				siteId={ selectedSite?.ID }
				product={ product }
				purchaseId={ purchaseId }
				couponCode={ couponCode }
				redirectTo={ redirectTo }
				feature={ selectedFeature }
			/>
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

function shouldShowCompositeCheckout( cart, countryCode, locale ) {
	if ( config.isEnabled( 'composite-checkout-wpcom' ) ) {
		return true;
	}
	// Disable for domains in the cart
	if ( cart?.products?.find( product => product.is_domain_registration ) ) {
		return false;
	}
	// Disable for jetpack plans
	if ( cart?.products?.find( product => product.product_slug.includes( 'jetpack' ) ) ) {
		return false;
	}
	// Disable for non-EN
	if ( ! locale?.toLowerCase().startsWith( 'en' ) ) {
		return false;
	}
	// Disable for non-US
	if ( countryCode?.toLowerCase() !== 'us' ) {
		return false;
	}

	if ( abtest( 'showCompositeCheckout' ) === 'composite' ) {
		return true;
	}
	return false;
}
