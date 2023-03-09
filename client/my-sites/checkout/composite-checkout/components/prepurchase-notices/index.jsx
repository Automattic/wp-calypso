import {
	getProductFromSlug,
	isJetpackAntiSpam,
	isJetpackAntiSpamSlug,
	isJetpackBackup,
	isJetpackBackupSlug,
	isJetpackPlanSlug,
	isJetpackScan,
	isJetpackScanSlug,
	planHasFeature,
	JETPACK_SOCIAL_PRODUCTS,
	WPCOM_FEATURES_ANTISPAM,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_SCAN,
	JETPACK_SOCIAL_ADVANCED_PRODUCTS,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { requestRewindCapabilities } from 'calypso/state/rewind/capabilities/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getSitePlan,
	getSiteProducts,
	isJetpackMinimumVersion,
	getSiteOption,
} from 'calypso/state/sites/selectors';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import CartPlanOverlapsOwnedProductNotice from './cart-plan-overlaps-owned-product-notice';
import JetpackPluginRequiredVersionNotice from './jetpack-plugin-required-version-notice';
import SitePlanIncludesCartProductNotice from './site-plan-includes-cart-product-notice';
import './style.scss';

/**
 * Renders the most appropriate pre-purchase notice (if applicable)
 * from a range of possible options.
 */
const PrePurchaseNotices = () => {
	const dispatch = useDispatch();

	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID;
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const cartItemSlugs = responseCart.products.map( ( item ) => item.product_slug );
	const isMonthly = cartItemSlugs.some( ( slug ) => slug.includes( 'monthly' ) );

	/**
	 * Ensure site rewind capabilities are loaded, for use by isPlanIncludingSiteBackup().
	 */
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( requestRewindCapabilities( siteId ) );
	}, [ dispatch, siteId ] );

	const currentSitePlan = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}

		return getSitePlan( state, siteId );
	} );

	const currentSiteProducts = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}

		const products = getSiteProducts( state, siteId ) || [];
		return products.filter( ( p ) => ! p.expired );
	} );

	const siteProductThatOverlapsCartPlan = useSelector( ( state ) => {
		const planSlugInCart = cartItemSlugs.find( isJetpackPlanSlug );

		if ( ! planSlugInCart ) {
			return null;
		}

		const socialProductSlug = JETPACK_SOCIAL_ADVANCED_PRODUCTS.filter( ( slug ) =>
			isMonthly ? slug.includes( 'monthly' ) : ! slug.includes( 'monthly' )
		)[ 0 ];

		const siteHasSocial = currentSiteProducts.find(
			( product ) =>
				product.productSlug === socialProductSlug &&
				JETPACK_SOCIAL_PRODUCTS.includes( product.productSlug )
		);

		if ( siteHasSocial && planHasFeature( planSlugInCart, socialProductSlug ) ) {
			return siteHasSocial;
		}

		if (
			planHasFeature( planSlugInCart, WPCOM_FEATURES_BACKUPS ) &&
			siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
		) {
			return currentSiteProducts.find( isJetpackBackup );
		}

		if (
			planHasFeature( planSlugInCart, WPCOM_FEATURES_ANTISPAM ) &&
			siteHasFeature( state, siteId, WPCOM_FEATURES_ANTISPAM )
		) {
			return currentSiteProducts.find( isJetpackAntiSpam );
		}

		if (
			planHasFeature( planSlugInCart, WPCOM_FEATURES_SCAN ) &&
			siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN )
		) {
			return currentSiteProducts.find( isJetpackScan );
		}

		return null;
	} );

	/**
	 * The product currently in the cart that overlaps/conflicts with the current active site plan.
	 */
	const cartProductThatOverlapsSitePlan = useSelector( ( state ) => {
		const backupSlugInCart = cartItemSlugs.find( isJetpackBackupSlug );
		const antiSpamSlugInCart = cartItemSlugs.find( isJetpackAntiSpamSlug );
		const scanSlugInCart = cartItemSlugs.find( isJetpackScanSlug );

		if ( backupSlugInCart && siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS ) ) {
			return getProductFromSlug( backupSlugInCart );
		}

		if ( antiSpamSlugInCart && siteHasFeature( state, siteId, WPCOM_FEATURES_ANTISPAM ) ) {
			return getProductFromSlug( antiSpamSlugInCart );
		}

		if ( scanSlugInCart && siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) ) {
			return getProductFromSlug( scanSlugInCart );
		}

		return null;
	} );

	const BACKUP_MINIMUM_JETPACK_VERSION = '8.5';
	const siteHasBackupMinimumPluginVersion = useSelector( ( state ) => {
		const activeConnectedPlugins = getSiteOption(
			state,
			siteId,
			'jetpack_connection_active_plugins'
		);
		const backupPluginActive =
			Array.isArray( activeConnectedPlugins ) &&
			activeConnectedPlugins.includes( 'jetpack-backup' );
		return (
			backupPluginActive || isJetpackMinimumVersion( state, siteId, BACKUP_MINIMUM_JETPACK_VERSION )
		);
	} );

	// All these notices (and the selectors that drive them)
	// require a site ID to work. We should *conceptually* always
	// have a site ID handy; consider this a guard, or an
	// explicit declaration that all code beyond this point can
	// safely assume a site ID has been defined.
	if ( ! siteId ) {
		return null;
	}

	// This site has an active Jetpack product purchase, but we're
	// attempting to buy a plan that includes the same one as well.
	// i.e. User owns a Jetpack Backup product, and is attempting
	// to purchase Jetpack Security.
	if ( siteProductThatOverlapsCartPlan ) {
		return (
			<CartPlanOverlapsOwnedProductNotice
				product={ siteProductThatOverlapsCartPlan }
				selectedSite={ selectedSite }
			/>
		);
	}

	// We're attempting to buy Jetpack Backup individually,
	// but this site already has a plan that includes it.
	// ignore the error on free plans as they do not include any paid features
	if (
		currentSitePlan &&
		cartProductThatOverlapsSitePlan &&
		currentSitePlan.product_slug !== 'jetpack_free'
	) {
		return (
			<SitePlanIncludesCartProductNotice
				plan={ currentSitePlan }
				product={ cartProductThatOverlapsSitePlan }
				selectedSite={ selectedSite }
			/>
		);
	}

	// We're attempting to buy a Jetpack Backup product,
	// but this site does not have the minimum plugin version.
	const backupSlugInCart = cartItemSlugs.find( isJetpackBackupSlug );
	const backupProductInCart = getProductFromSlug( backupSlugInCart );
	if ( ! siteHasBackupMinimumPluginVersion && backupProductInCart ) {
		return (
			<JetpackPluginRequiredVersionNotice
				product={ backupProductInCart }
				minVersion={ BACKUP_MINIMUM_JETPACK_VERSION }
			/>
		);
	}

	return null;
};

const Wrapper = ( props ) => {
	const notice = PrePurchaseNotices( props );

	return (
		notice && (
			<div className="prepurchase-notices__container">
				<Notice status="is-info" showDismiss={ false }>
					{ notice }
				</Notice>
			</div>
		)
	);
};

export default Wrapper;
