/**
 * External dependencies
 */
import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';
import wp from 'lib/wp';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import cookie from 'cookie';
import { isArray } from 'lodash';

/**
 * Internal Dependencies
 */
import CheckoutContainer from './checkout/checkout-container';
import IncludedProductNoticeContent from './checkout/included-product-notice-content';
import OwnedProductNoticeContent from './checkout/owned-product-notice-content';
import JetpackMinimumPluginVersionNoticeContent from './checkout/jetpack-minimum-plugin-version-notice-content';
import CompositeCheckout from './composite-checkout/composite-checkout';
import { fetchStripeConfiguration } from './composite-checkout/payment-method-helpers';
import { getPlanByPathSlug } from 'lib/plans';
import { GROUP_JETPACK, JETPACK_PLANS } from 'lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { isJetpackBackup, isJetpackBackupSlug } from 'lib/products-values';
import { StripeHookProvider } from 'lib/stripe';
import config from 'config';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import {
	isJetpackSite,
	isJetpackMinimumVersion,
	getSiteProducts,
	getSitePlan,
} from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { logToLogstash } from 'state/logstash/actions';
import {
	isPlanIncludingSiteBackup,
	isBackupProductIncludedInSitePlan,
} from 'state/sites/products/conflicts';
import { abtest } from 'lib/abtest';
import Recaptcha from 'signup/recaptcha';

const debug = debugFactory( 'calypso:checkout-system-decider' );
const wpcom = wp.undocumented();

function getGeoLocationFromCookie() {
	const cookies = cookie.parse( document.cookie );

	return cookies.country_code;
}

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
	isLoggedOutCart,
	isNoSiteCart,
} ) {
	const siteId = selectedSite?.ID;
	const jetpackPlan = getPlanByPathSlug( product, GROUP_JETPACK );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const countryCode =
		useSelector( ( state ) => getCurrentUserCountryCode( state ) ) || getGeoLocationFromCookie();
	const locale = useSelector( ( state ) => getCurrentLocaleSlug( state ) );
	const isJetpackPlanIncludingSiteBackup = useSelector( ( state ) =>
		jetpackPlan ? isPlanIncludingSiteBackup( state, siteId, jetpackPlan.getStoreSlug() ) : null
	);
	const isBackupIncludedInSitePlan = useSelector( ( state ) =>
		isJetpackBackupSlug( product )
			? isBackupProductIncludedInSitePlan( state, siteId, product )
			: null
	);

	const BACKUP_MINIMUM_PLUGIN_VERSION = '8.5';
	const siteHasBackupMinPluginVersion = useSelector( ( state ) =>
		isJetpackMinimumVersion( state, siteId, BACKUP_MINIMUM_PLUGIN_VERSION )
	);
	const currentProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const reduxDispatch = useDispatch();
	const translate = useTranslate();

	let infoMessage;

	const backupProduct = isArray( currentProducts ) && currentProducts.find( isJetpackBackup );
	if ( backupProduct && ! siteHasBackupMinPluginVersion ) {
		infoMessage = (
			<JetpackMinimumPluginVersionNoticeContent
				product={ backupProduct }
				minVersion={ BACKUP_MINIMUM_PLUGIN_VERSION }
			/>
		);
	}

	if ( isJetpackPlanIncludingSiteBackup && selectedSite ) {
		infoMessage = backupProduct && (
			<OwnedProductNoticeContent product={ backupProduct } selectedSite={ selectedSite } />
		);
	}

	if ( isBackupIncludedInSitePlan && selectedSite ) {
		infoMessage = currentPlan && (
			<IncludedProductNoticeContent
				plan={ currentPlan }
				productSlug={ product }
				selectedSite={ selectedSite }
			/>
		);
	}

	const checkoutVariant = getCheckoutVariant(
		cart,
		countryCode,
		locale,
		product,
		purchaseId,
		isJetpack,
		isAtomic,
		isLoggedOutCart
	);

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
		let siteSlug = selectedSite?.slug;

		if ( ! siteSlug ) {
			siteSlug = 'no-site';

			if ( isLoggedOutCart || isNoSiteCart ) {
				siteSlug = 'no-user';
			}
		}

		return (
			<>
				<CheckoutErrorBoundary
					errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
					onError={ logCheckoutError }
				>
					<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
						<CompositeCheckout
							siteSlug={ siteSlug }
							siteId={ selectedSite?.ID }
							product={ product }
							purchaseId={ purchaseId }
							couponCode={ couponCode }
							redirectTo={ redirectTo }
							feature={ selectedFeature }
							plan={ plan }
							cart={ cart }
							isComingFromUpsell={ isComingFromUpsell }
							infoMessage={ infoMessage }
							isLoggedOutCart={ isLoggedOutCart }
							isNoSiteCart={ isNoSiteCart }
							getCart={ isLoggedOutCart || isNoSiteCart ? () => Promise.resolve( cart ) : null }
						/>
					</StripeHookProvider>
				</CheckoutErrorBoundary>
				{ isLoggedOutCart && <Recaptcha badgePosition="bottomright" /> }
			</>
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
			infoMessage={ infoMessage }
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
	isAtomic,
	isLoggedOutCart
) {
	if ( config.isEnabled( 'old-checkout-force' ) ) {
		debug( 'shouldShowCompositeCheckout false because old-checkout-force flag is set' );
		return 'old-checkout';
	}

	if ( config.isEnabled( 'composite-checkout-force' ) ) {
		debug( 'shouldShowCompositeCheckout true because force config is enabled' );
		return 'composite-checkout';
	}

	// Disable for Brazil and India
	if ( countryCode?.toLowerCase() === 'br' || countryCode?.toLowerCase() === 'in' ) {
		debug(
			'shouldShowCompositeCheckout false because country is not allowed',
			countryCode?.toLowerCase()
		);
		return 'disallowed-geo';
	}

	// Disable for Jetpack sites in production
	if ( config( 'env_id' ) === 'production' && isJetpack && ! isAtomic ) {
		debug( 'shouldShowCompositeCheckout false because jetpack site' );
		return 'jetpack-site';
	}
	// Disable for Jetpack plans in production
	if (
		config( 'env_id' ) === 'production' &&
		cart.products?.find( ( product ) => product.product_slug.includes( 'jetpack' ) )
	) {
		debug( 'shouldShowCompositeCheckout false because cart contains jetpack' );
		return 'jetpack-product';
	}

	// If the URL is adding a product, only allow things already supported.
	// Calypso uses special slugs that aren't real product slugs when adding
	// products via URL, so we list those slugs here. Renewals use actual slugs,
	// so they do not need to go through this check.
	const isRenewal = !! purchaseId;
	let pseudoSlugsToAllow = [
		'blogger',
		'blogger-2-years',
		'business',
		'business-2-years',
		'concierge-session',
		'ecommerce',
		'ecommerce-2-years',
		'personal',
		'personal-2-years',
		'premium', // WordPress.com or Jetpack Premium Yearly
		'premium-2-years',
	];
	const jetpackPseudoSlugsToAllow = [
		'jetpack-personal',
		'jetpack-personal-monthly',
		'premium-monthly',
		'professional',
		'professional-monthly',
	];
	if ( config( 'env_id' ) !== 'production' ) {
		pseudoSlugsToAllow = [
			...pseudoSlugsToAllow,
			...jetpackPseudoSlugsToAllow,
			...JETPACK_PLANS,
			...JETPACK_PRODUCTS_LIST,
		];
	}
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

	// Removes users from initial AB test
	if (
		cart.currency === 'USD' &&
		countryCode?.toLowerCase() === 'us' &&
		locale?.toLowerCase().startsWith( 'en' )
	) {
		debug( 'shouldShowCompositeCheckout true' );
		return 'composite-checkout';
	}

	// Show composite checkout for registrationless checkout users
	const urlParams = new URLSearchParams( window.location.search );
	if ( isLoggedOutCart || 'no-user' === urlParams.get( 'cart' ) ) {
		debug( 'shouldShowCompositeCheckout true' );
		return 'composite-checkout';
	}

	// Add remaining users to new AB test with 10% holdout
	if ( abtest( 'showCompositeCheckoutI18N' ) !== 'composite' ) {
		debug( 'shouldShowCompositeCheckout false because user is in abtest control variant' );
		return 'control-variant';
	}

	debug( 'shouldShowCompositeCheckout true' );
	return 'composite-checkout';
}

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}
