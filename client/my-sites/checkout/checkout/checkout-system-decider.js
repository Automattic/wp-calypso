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
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { getGeoCountryShort } from 'state/geo/selectors';

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
	const countryCode = useSelector( state => getGeoCountryShort( state ) );
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
	if ( ! config.isEnabled( 'composite-checkout-wpcom' ) ) {
		return false;
	}
	if ( cart?.products?.find( product => product.is_domain_registration ) ) {
		return false;
	}
	// TODO: if a non-wpcom product is in the cart, return false
	if ( ! locale?.toLowerCase().startsWith( 'en' ) ) {
		return false;
	}
	if ( countryCode?.toLowerCase() !== 'us' ) {
		return false;
	}
	if ( abtest( 'showCompositeCheckout' ) === 'composite' ) {
		return true;
	}
	return false;
}
