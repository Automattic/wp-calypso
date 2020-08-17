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
import { GROUP_JETPACK } from 'lib/plans/constants';
import { isJetpackBackup, isJetpackBackupSlug, getProductFromSlug } from 'lib/products-values';
import { StripeHookProvider } from 'lib/stripe';
import config from 'config';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { isJetpackMinimumVersion, getSiteProducts, getSitePlan } from 'state/sites/selectors';
import { logToLogstash } from 'state/logstash/actions';
import {
	isPlanIncludingSiteBackup,
	isBackupProductIncludedInSitePlan,
} from 'state/sites/products/conflicts';
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

	const countryCode =
		useSelector( ( state ) => getCurrentUserCountryCode( state ) ) || getGeoLocationFromCookie();
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

	if ( isJetpackBackupSlug( product ) && ! siteHasBackupMinPluginVersion ) {
		const backupProductInCart = getProductFromSlug( product );
		infoMessage = (
			<JetpackMinimumPluginVersionNoticeContent
				product={ backupProductInCart }
				minVersion={ BACKUP_MINIMUM_PLUGIN_VERSION }
			/>
		);
	}

	if ( isJetpackPlanIncludingSiteBackup && selectedSite ) {
		const backupProduct = isArray( currentProducts ) && currentProducts.find( isJetpackBackup );
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

	const checkoutVariant = getCheckoutVariant( countryCode );

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

function getCheckoutVariant( countryCode ) {
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

	debug( 'shouldShowCompositeCheckout true' );
	return 'composite-checkout';
}

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}
