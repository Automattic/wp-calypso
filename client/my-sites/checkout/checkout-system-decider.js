/**
 * External dependencies
 */
import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';
import wp from 'lib/wp';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { isArray } from 'lodash';

/**
 * Internal Dependencies
 */
import CheckoutContainer from './checkout/checkout-container';
import DuplicateProductNoticeContent from './checkout/duplicate-product-notice-content';
import CompositeCheckout from './composite-checkout/composite-checkout';
import { fetchStripeConfiguration } from './composite-checkout/payment-method-helpers';
import { getPlanByPathSlug } from 'lib/plans';
import { GROUP_JETPACK } from 'lib/plans/constants';
import { isJetpackBackup } from 'lib/products-values';
import { StripeHookProvider } from 'lib/stripe';
import config from 'config';
import { getCurrentUserLocale, getCurrentUserCountryCode } from 'state/current-user/selectors';
import { isJetpackSite, getSiteProducts } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { logToLogstash } from 'state/logstash/actions';
import { isPlanIncludingSiteBackup } from 'state/sites/products/conflicts';
import { abtest } from 'lib/abtest';

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
} ) {
	const siteId = selectedSite?.ID;
	const jetpackPlan = getPlanByPathSlug( product, GROUP_JETPACK );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const countryCode = useSelector( ( state ) => getCurrentUserCountryCode( state ) );
	const locale = useSelector( ( state ) => getCurrentUserLocale( state ) );
	const isIncludingSiteBackup = useSelector( ( state ) =>
		jetpackPlan ? isPlanIncludingSiteBackup( state, siteId, jetpackPlan.getStoreSlug() ) : null
	);
	const products = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const reduxDispatch = useDispatch();
	const translate = useTranslate();

	let duplicateBackupNotice;

	if ( isIncludingSiteBackup && selectedSite ) {
		const backupProduct = isArray( products ) && products.find( isJetpackBackup );

		duplicateBackupNotice = backupProduct && (
			<DuplicateProductNoticeContent product={ backupProduct } selectedSite={ selectedSite } />
		);
	}

	const checkoutVariant = getCheckoutVariant(
		cart,
		countryCode,
		locale,
		product,
		purchaseId,
		isJetpack,
		isAtomic
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
						isComingFromUpsell={ isComingFromUpsell }
						infoMessage={ duplicateBackupNotice }
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
			infoMessage={ duplicateBackupNotice }
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
	const pseudoSlugsToAllow = [
		'blogger',
		'blogger-2-years',
		'business',
		'business-2-years',
		'concierge-session',
		'ecommerce',
		'ecommerce-2-years',
		'jetpack_backup_daily',
		'jetpack_backup_realtime',
		'jetpack_personal',
		'jetpack-personal',
		'jetpack-personal-monthly',
		'jetpack_scan',
		'jetpack_search',
		'personal',
		'personal-2-years',
		'premium', // WordPress.com or Jetpack Premium Yearly
		'premium-monthly', // Jetpack Premium Monthly
		'premium-2-years',
		'professional',
		'professional-monthly',
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

	// Removes users from initial AB test
	if (
		cart.currency === 'USD' &&
		countryCode?.toLowerCase() === 'us' &&
		locale?.toLowerCase().startsWith( 'en' )
	) {
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
