/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import {
	getProductFromSlug,
	isJetpackBackup,
	isJetpackBackupSlug,
	isJetpackPlanSlug,
} from '@automattic/calypso-products';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import {
	getSitePlan,
	getSiteProducts,
	isJetpackMinimumVersion,
} from 'calypso/state/sites/selectors';
import {
	isPlanIncludingSiteBackup,
	isBackupProductIncludedInSitePlan,
} from 'calypso/state/sites/products/conflicts';
import Notice from 'calypso/components/notice';
import SitePlanIncludesCartProductNotice from './site-plan-includes-cart-product-notice';
import CartPlanOverlapsOwnedProductNotice from './cart-plan-overlaps-owned-product-notice';
import JetpackPluginRequiredVersionNotice from './jetpack-plugin-required-version-notice';

import './style.scss';

/**
 * Renders the most appropriate pre-purchase notice (if applicable)
 * from a range of possible options.
 */
const PrePurchaseNotices = () => {
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID;

	const { responseCart } = useShoppingCart();
	const cartItemSlugs = responseCart.products.map( ( item ) => item.product_slug );

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

	const backupSlugInCart = cartItemSlugs.find( isJetpackBackupSlug );

	const cartPlanOverlapsSiteBackupPurchase = useSelector( ( state ) => {
		const planSlugInCart = cartItemSlugs.find( isJetpackPlanSlug );

		return planSlugInCart && isPlanIncludingSiteBackup( state, siteId, planSlugInCart );
	} );

	const sitePlanIncludesCartBackupProduct = useSelector(
		( state ) =>
			backupSlugInCart && isBackupProductIncludedInSitePlan( state, siteId, backupSlugInCart )
	);

	const BACKUP_MINIMUM_JETPACK_VERSION = '8.5';
	const siteHasBackupMinimumPluginVersion = useSelector( ( state ) =>
		isJetpackMinimumVersion( state, siteId, BACKUP_MINIMUM_JETPACK_VERSION )
	);

	// All these notices (and the selectors that drive them)
	// require a site ID to work. We should *conceptually* always
	// have a site ID handy; consider this a guard, or an
	// explicit declaration that all code beyond this point can
	// safely assume a site ID has been defined.
	if ( ! siteId ) {
		return null;
	}

	// This site has an active Jetpack Backup product purchase,
	// but we're attempting to buy a plan that includes one as well
	const siteBackupProduct = currentSiteProducts.find( isJetpackBackup );
	if ( cartPlanOverlapsSiteBackupPurchase && siteBackupProduct ) {
		return (
			<CartPlanOverlapsOwnedProductNotice
				product={ siteBackupProduct }
				selectedSite={ selectedSite }
			/>
		);
	}

	// Notices after this point require a Backup product to be in the cart
	if ( ! backupSlugInCart ) {
		return null;
	}

	const backupProductInCart = getProductFromSlug( backupSlugInCart );

	// We're attempting to buy Jetpack Backup individually,
	// but this site already has a plan that includes it
	if ( sitePlanIncludesCartBackupProduct && currentSitePlan ) {
		return (
			<SitePlanIncludesCartProductNotice
				plan={ currentSitePlan }
				product={ backupProductInCart }
				selectedSite={ selectedSite }
			/>
		);
	}

	if ( ! siteHasBackupMinimumPluginVersion ) {
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
