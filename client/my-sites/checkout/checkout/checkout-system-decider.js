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
import { getCurrentUserLocale, getCurrentUserCountryCode } from 'state/current-user/selectors';
import { isJetpackSite } from 'state/sites/selectors';

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
	const isJetpack = useSelector( state => isJetpackSite( state, selectedSite?.ID ) );
	const countryCode = useSelector( state => getCurrentUserCountryCode( state ) );
	const locale = useSelector( state => getCurrentUserLocale( state ) );

	// TODO: fetch the current cart, ideally without using CartData, and use that to pass to shouldShowCompositeCheckout

	if ( shouldShowCompositeCheckout( cart, countryCode, locale, product, isJetpack ) ) {
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

function shouldShowCompositeCheckout( cart, countryCode, locale, productSlug, isJetpack ) {
	if ( config.isEnabled( 'composite-checkout-wpcom' ) ) {
		return true;
	}
	// Disable if this is a jetpack site
	if ( isJetpack ) {
		return false;
	}
	// If the URL is adding a product, only allow wpcom plans
	const slugFragmentsToAllow = [
		'personal-bundle',
		'value_bundle',
		'value-bundle',
		'blogger',
		'ecommerce',
		'business',
	];
	if (
		productSlug &&
		! slugFragmentsToAllow.find( fragment => productSlug.includes( fragment ) )
	) {
		return false;
	}
	// Disable for non-USD
	if ( cart?.currency !== 'USD' ) {
		return false;
	}
	// Disable for domains in the cart
	if ( cart?.products?.find( product => product.is_domain_registration ) ) {
		return false;
	}
	// Disable for GSuite plans
	if ( cart?.products?.find( product => product.product_slug.includes( 'gapps' ) ) ) {
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

	return false;
}
