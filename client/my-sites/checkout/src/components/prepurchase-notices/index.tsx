import {
	getProductFromSlug,
	isJetpackPlanSlug,
	isJetpackAntiSpamSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackBoostSlug,
	isJetpackVideoPressSlug,
	isJetpackSocialSlug,
	getAllFeaturesForPlan,
	planFeaturesIncludesProducts,
	planHasSuperiorFeature,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import Notice from 'calypso/components/notice';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSitePlan, isJetpackMinimumVersion, getSiteOption } from 'calypso/state/sites/selectors';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import JetpackPluginRequiredVersionNotice from './jetpack-plugin-required-version-notice';
import SitePlanIncludesCartProductNotice from './site-plan-includes-cart-product-notice';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import type { AppState } from 'calypso/types';
import './style.scss';

/**
 * Renders the most appropriate pre-purchase notice (if applicable)
 * from a range of possible options.
 */
const PrePurchaseNotices = () => {
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID;
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const cartItemSlugs = responseCart.products.map( ( item ) => item.product_slug );

	const currentSitePlan = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}

		return getSitePlan( state, siteId );
	} );

	const getMatchingProducts = useCallback( ( items: ResponseCartProduct[], planSlug: string ) => {
		const planFeatures = getAllFeaturesForPlan( planSlug ) as ReadonlyArray< string >;

		return items.filter( ( item ) => {
			const productSlug = item.product_slug;

			const productFoundInPlanFeatures =
				planFeatures.includes( productSlug ) || planHasSuperiorFeature( planSlug, productSlug );

			if ( productFoundInPlanFeatures ) {
				return true;
			}

			if ( isJetpackPlanSlug( planSlug ) ) {
				if ( isJetpackBackupSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_BACKUP_PRODUCTS );
				}
				if ( isJetpackScanSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_SCAN_PRODUCTS );
				}
				if ( isJetpackAntiSpamSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_ANTI_SPAM_PRODUCTS );
				}
				if ( isJetpackVideoPressSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_VIDEOPRESS_PRODUCTS );
				}
				if ( isJetpackBoostSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_BOOST_PRODUCTS );
				}
				if ( isJetpackSocialSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_SOCIAL_PRODUCTS );
				}
				if ( isJetpackSearchSlug( productSlug ) ) {
					return planFeaturesIncludesProducts( planFeatures, JETPACK_SEARCH_PRODUCTS );
				}
			}

			return false;
		} );
	}, [] );

	const cartProductThatOverlapsSitePlan = useMemo( () => {
		const planSlugOnSite = currentSitePlan?.product_slug;

		// Bypass the notice if the site doesn't have a plan or the plan is Jetpack Free
		if ( ! planSlugOnSite || planSlugOnSite === 'jetpack_free' ) {
			return null;
		}

		const matchingProducts = getMatchingProducts( responseCart.products, planSlugOnSite );

		return matchingProducts?.[ 0 ];
	}, [ currentSitePlan?.product_slug, getMatchingProducts, responseCart.products ] );

	const BACKUP_MINIMUM_JETPACK_VERSION = '8.5';
	const siteHasBackupMinimumPluginVersion = useSelector( ( state: AppState ) => {
		const activeConnectedPlugins = getSiteOption(
			state,
			siteId,
			'jetpack_connection_active_plugins'
		) as string[];
		const backupPluginActive =
			Array.isArray( activeConnectedPlugins ) &&
			activeConnectedPlugins.includes( 'jetpack-backup' );
		return (
			backupPluginActive ||
			( siteId && isJetpackMinimumVersion( state, siteId, BACKUP_MINIMUM_JETPACK_VERSION ) )
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
	const backupProductInCart = backupSlugInCart && getProductFromSlug( backupSlugInCart );
	if (
		! siteHasBackupMinimumPluginVersion &&
		backupProductInCart &&
		// getProductFromSlug returns a string if it fails, so we want to check for that.
		typeof backupProductInCart !== 'string'
	) {
		return (
			<JetpackPluginRequiredVersionNotice
				product={ backupProductInCart }
				minVersion={ BACKUP_MINIMUM_JETPACK_VERSION }
			/>
		);
	}

	return null;
};

const PrePurchaseNoticesWrapper = () => {
	const notice = PrePurchaseNotices();

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

function PrePurchaseNoticesQueryContainer( {
	siteId,
	isSiteless,
}: {
	siteId: number | undefined;
	isSiteless: boolean;
} ) {
	return (
		<>
			<QuerySitePurchases siteId={ siteId } />
			{ isSiteless && <QueryUserPurchases /> }
			<PrePurchaseNoticesWrapper />
		</>
	);
}

export default PrePurchaseNoticesQueryContainer;
