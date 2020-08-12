/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getAllCartItems } from 'lib/cart-values/cart-items';
import { isJetpackPlan } from 'lib/products-values/is-jetpack-plan';
import { isJetpackBackup } from 'lib/products-values/is-jetpack-backup';
import getSelectedSite from 'state/ui/selectors/get-selected-site';
import { getSitePlan, getSiteProducts } from 'state/sites/selectors';
import {
	isPlanIncludingSiteBackup,
	isBackupProductIncludedInSitePlan,
} from 'state/sites/products/conflicts';
import Notice from 'components/notice';
import IncludedProductNoticeContent from '../included-product-notice-content';
import OwnedProductNoticeContent from '../owned-product-notice-content';

import './style.scss';

/**
 * Renders the most appropriate pre-purchase notice (if applicable)
 * from a range of possible options.
 */
const PrePurchaseNotices = ( { cart } ) => {
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID;

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

	const cartItems = getAllCartItems( cart );
	const backupProductInCart = cartItems.find( isJetpackBackup );

	const cartPlanOverlapsSiteBackupPurchase = useSelector( ( state ) => {
		const jetpackPlanInCart = cartItems.find( isJetpackPlan );

		return (
			jetpackPlanInCart &&
			isPlanIncludingSiteBackup( state, siteId, jetpackPlanInCart.product_slug )
		);
	} );

	const sitePlanIncludesCartBackupProduct = useSelector(
		( state ) =>
			backupProductInCart &&
			isBackupProductIncludedInSitePlan( state, siteId, backupProductInCart.product_slug )
	);

	// This site has an active Jetpack Backup product purchase,
	// but we're attempting to buy a plan that includes one as well
	if ( cartPlanOverlapsSiteBackupPurchase ) {
		const siteBackupProduct = currentSiteProducts.find( isJetpackBackup );

		return (
			<OwnedProductNoticeContent product={ siteBackupProduct } selectedSite={ selectedSite } />
		);
	}

	// We're attempting to buy Jetpack Backup individually,
	// but this site already has a plan that includes it
	if ( sitePlanIncludesCartBackupProduct ) {
		return (
			<IncludedProductNoticeContent
				plan={ currentSitePlan }
				productSlug={ backupProductInCart.product_slug }
				selectedSite={ selectedSite }
			/>
		);
	}

	return false;
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
