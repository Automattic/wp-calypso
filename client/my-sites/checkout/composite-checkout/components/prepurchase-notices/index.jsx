import {
	getProductFromSlug,
	isJetpackAntiSpamSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	getAllFeaturesForPlan,
	planHasSuperiorFeature,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { requestRewindCapabilities } from 'calypso/state/rewind/capabilities/actions';
import { getSitePlan, isJetpackMinimumVersion, getSiteOption } from 'calypso/state/sites/selectors';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
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

	const getMatchingProducts = ( items, planSlug, isCartItem ) => {
		const planFeatures = getAllFeaturesForPlan( planSlug );

		return items.filter( ( item ) => {
			const productSlug = isCartItem ? item.product_slug : item.productSlug;
			//some products have had many variations over the years so we need to check an abstraction for backup, scan and Akismet.
			return (
				planFeatures.includes( productSlug ) ||
				planHasSuperiorFeature( planSlug, productSlug ) ||
				isJetpackBackupSlug( productSlug ) ||
				isJetpackScanSlug( productSlug ) ||
				isJetpackAntiSpamSlug( productSlug )
			);
		} );
	};

	const cartProductThatOverlapsSitePlan = useMemo( () => {
		const planSlugOnSite = currentSitePlan?.product_slug;

		if ( ! planSlugOnSite || planSlugOnSite === 'jetpack_free' ) {
			return null;
		}

		const matchingProducts = getMatchingProducts( responseCart.products, planSlugOnSite, true );
		return matchingProducts?.[ 0 ];
	}, [ currentSitePlan, responseCart.products ] );

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

	// We're attempting to buy Jetpack Backup individually,
	// but this site already has a plan that includes it.
	// ignore the error on free plans as they do not include any paid features
	if ( currentSitePlan && cartProductThatOverlapsSitePlan ) {
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
