/**
 * External dependencies
 */
import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';
import wp from 'lib/wp';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import CheckoutContainer from './checkout/checkout-container';
import CompositeCheckout from './composite-checkout/composite-checkout';
import { fetchStripeConfiguration } from './composite-checkout/payment-method-helpers';
import { StripeHookProvider } from 'lib/stripe';
import config from 'config';
import { getCurrentUserLocale, getCurrentUserCountryCode } from 'state/current-user/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { logToLogstash } from 'state/logstash/actions';

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
	isGutenboardingCreate,
	isComingFromUpsell,
	plan,
	selectedSite,
	reduxStore,
	redirectTo,
	upgradeIntent,
	clearTransaction,
	cart,
	isWhiteGloveOffer,
} ) {
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const countryCode = useSelector( ( state ) => getCurrentUserCountryCode( state ) );
	const locale = useSelector( ( state ) => getCurrentUserLocale( state ) );
	const reduxDispatch = useDispatch();
	const checkoutVariant = getCheckoutVariant(
		cart,
		countryCode,
		locale,
		product,
		purchaseId,
		isJetpack,
		isAtomic
	);
	const translate = useTranslate();

	useEffect( () => {
		if ( product ) {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message: 'CheckoutSystemDecider saw productSlug to add',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						productSlug: product,
					},
				} )
			);
		}
	}, [ reduxDispatch, product ] );

	useEffect( () => {
		if ( 'disallowed-product' === checkoutVariant ) {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message: 'CheckoutSystemDecider unsupported product for composite checkout',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						productSlug: product,
					},
				} )
			);
		}
	}, [ reduxDispatch, checkoutVariant, product ] );

	const logCheckoutError = useCallback(
		( error ) => {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message: 'composite checkout load error',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						env: config( 'env_id' ),
						type: 'checkout_system_decider',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch ]
	);

	if ( ! cart || ! cart.currency ) {
		debug( 'not deciding yet; cart has not loaded' );
		return null; // TODO: replace with loading page
	}

	if ( 'composite-checkout' === checkoutVariant ) {
		return (
			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logCheckoutError }
			>
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
						isWhiteGloveOffer={ isWhiteGloveOffer }
						isComingFromUpsell={ isComingFromUpsell }
					/>
				</StripeHookProvider>
			</CheckoutErrorBoundary>
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
			isGutenboardingCreate={ isGutenboardingCreate }
			isComingFromUpsell={ isComingFromUpsell }
			plan={ plan }
			selectedSite={ selectedSite }
			reduxStore={ reduxStore }
			redirectTo={ redirectTo }
			upgradeIntent={ upgradeIntent }
			clearTransaction={ clearTransaction }
			isWhiteGloveOffer={ isWhiteGloveOffer }
		/>
	);
}

function getCheckoutVariant(
	cart,
	countryCode,
	locale,
	productSlug,
	purchaseId,
	isJetpack,
	isAtomic
) {
	if ( config.isEnabled( 'old-checkout-force' ) ) {
		debug( 'shouldShowCompositeCheckout false because old-checkout-force flag is set' );
		return 'old-checkout';
	}

	if ( config.isEnabled( 'composite-checkout-force' ) ) {
		debug( 'shouldShowCompositeCheckout true because force config is enabled' );
		return 'composite-checkout';
	}

	// Disable if this is a jetpack site
	if ( isJetpack && ! isAtomic ) {
		debug( 'shouldShowCompositeCheckout false because jetpack site' );
		return 'jetpack-site';
	}
	// Disable for non-USD
	if ( cart.currency !== 'USD' ) {
		debug( 'shouldShowCompositeCheckout false because currency is not USD' );
		return 'disallowed-currency';
	}
	// Disable for jetpack plans
	if ( cart.products?.find( ( product ) => product.product_slug.includes( 'jetpack' ) ) ) {
		debug( 'shouldShowCompositeCheckout false because cart contains jetpack' );
		return 'jetpack-product';
	}
	// Disable for non-EN
	if ( ! locale?.toLowerCase().startsWith( 'en' ) ) {
		debug( 'shouldShowCompositeCheckout false because locale is not EN' );
		return 'disallowed-locale';
	}
	// Disable for non-US
	if ( countryCode?.toLowerCase() !== 'us' ) {
		debug( 'shouldShowCompositeCheckout false because country is not US' );
		return 'disallowed-geo';
	}

	// If the URL is adding a product, only allow things already supported.
	// Calypso uses special slugs that aren't real product slugs when adding
	// products via URL, so we list those slugs here. Renewals use actual slugs,
	// so they do not need to go through this check.
	const isRenewal = !! purchaseId;
	const pseudoSlugsToAllow = [
		'blogger',
		'blogger-2-years',
		'business',
		'business-2-years',
		'concierge-session',
		'ecommerce',
		'ecommerce-2-years',
		'personal',
		'personal-2-years',
		'premium',
		'premium-2-years',
	];
	const slugPrefixesToAllow = [ 'domain-mapping:', 'theme:' ];
	if (
		! isRenewal &&
		productSlug &&
		! pseudoSlugsToAllow.find( ( slug ) => productSlug === slug ) &&
		! slugPrefixesToAllow.find( ( slugPrefix ) => productSlug.startsWith( slugPrefix ) )
	) {
		debug(
			'shouldShowCompositeCheckout false because product does not match list of allowed products',
			productSlug
		);
		return 'disallowed-product';
	}

	debug( 'shouldShowCompositeCheckout true' );
	return 'composite-checkout';
}

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}
