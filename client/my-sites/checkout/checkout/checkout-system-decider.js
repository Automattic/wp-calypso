/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';
import wp from 'lib/wp';

/**
 * Internal Dependencies
 */
import CheckoutContainer from './checkout-container';
import CompositeCheckout from './composite-checkout';
import { fetchStripeConfiguration } from './composite-checkout-payment-methods';
import { StripeHookProvider } from 'lib/stripe';
import config from 'config';
import { getCurrentUserLocale, getCurrentUserCountryCode } from 'state/current-user/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { abtest } from 'lib/abtest';
import { logToLogstash } from 'state/logstash/actions';
import { getTlds } from 'lib/cart-values/cart-items';
import { tldsWithAdditionalDetailsForms } from 'components/domains/registrant-extra-info';

const debug = debugFactory( 'calypso:checkout-system-decider' );
const wpcom = wp.undocumented();

// Decide if we should use CompositeCheckout or CheckoutContainer
export default function CheckoutSystemDecider( {
	product,
	purchaseId,
	selectedFeature,
	couponCode,
	isComingFromSignup,
	isComingFromGutenboarding,
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
	const reduxDispatch = useDispatch();
	useEffect( () => {
		if ( product ) {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message: 'CheckoutSystemDecider saw productSlug to add',
					extra: {
						productSlug: product,
					},
				} )
			);
		}
	}, [ reduxDispatch, product ] );

	// TODO: fetch the current cart, ideally without using CartData, and use that to pass to shouldShowCompositeCheckout

	if ( ! cart || ! cart.currency ) {
		debug( 'not deciding yet; cart has not loaded' );
		return null; // TODO: replace with loading page
	}

	if ( shouldShowCompositeCheckout( cart, countryCode, locale, product, isJetpack ) ) {
		return (
			<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
				<CompositeCheckout
					siteSlug={ selectedSite?.slug }
					siteId={ selectedSite?.ID }
					product={ product }
					purchaseId={ purchaseId }
					couponCode={ couponCode }
					redirectTo={ redirectTo }
					feature={ selectedFeature }
					plan={ plan }
					cart={ cart }
				/>
			</StripeHookProvider>
		);
	}

	return (
		<CheckoutContainer
			product={ product }
			purchaseId={ purchaseId }
			selectedFeature={ selectedFeature }
			couponCode={ couponCode }
			isComingFromSignup={ isComingFromSignup }
			isComingFromGutenboarding={ isComingFromGutenboarding }
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
	if ( config.isEnabled( 'composite-checkout-force' ) ) {
		debug( 'shouldShowCompositeCheckout true because force config is enabled' );
		return true;
	}

	// Disable if this is a jetpack site
	if ( isJetpack ) {
		debug( 'shouldShowCompositeCheckout false because jetpack site' );
		return false;
	}
	// Disable for non-USD
	if ( cart.currency !== 'USD' ) {
		debug( 'shouldShowCompositeCheckout false because currency is not USD' );
		return false;
	}
	// Disable for GSuite plans
	if ( cart.products?.find( product => product.product_slug.includes( 'gapps' ) ) ) {
		debug( 'shouldShowCompositeCheckout false because cart contains GSuite' );
		return false;
	}
	// Disable for jetpack plans
	if ( cart.products?.find( product => product.product_slug.includes( 'jetpack' ) ) ) {
		debug( 'shouldShowCompositeCheckout false because cart contains jetpack' );
		return false;
	}
	// Disable for non-EN
	if ( ! locale?.toLowerCase().startsWith( 'en' ) ) {
		debug( 'shouldShowCompositeCheckout false because locale is not EN' );
		return false;
	}
	// Disable for non-US
	if ( countryCode?.toLowerCase() !== 'us' ) {
		debug( 'shouldShowCompositeCheckout false because country is not US' );
		return false;
	}
	// Disable for TLDs that have special contact forms
	if ( getTlds( cart ).find( tld => tldsWithAdditionalDetailsForms.includes( tld ) ) ) {
		debug(
			'shouldShowCompositeCheckout false because cart contains TLD with special contact form'
		);
		return false;
	}

	// If the URL is adding a product, only allow wpcom plans
	const slugFragmentsToAllow = [ 'personal', 'premium', 'blogger', 'ecommerce', 'business' ];
	if ( productSlug && ! slugFragmentsToAllow.find( fragment => productSlug === fragment ) ) {
		debug(
			'shouldShowCompositeCheckout false because product does not match whitelist',
			productSlug
		);
		return false;
	}

	if ( config.isEnabled( 'composite-checkout-testing' ) ) {
		debug( 'shouldShowCompositeCheckout true because testing config is enabled' );
		return true;
	}
	if ( abtest( 'showCompositeCheckout' ) === 'composite' ) {
		debug( 'shouldShowCompositeCheckout true because user is in abtest' );
		return true;
	}
	debug( 'shouldShowCompositeCheckout false because test not enabled' );
	return false;
}

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}
