import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_LIVE_SUPPORT,
} from '@automattic/calypso-products';
import { PluginPeriodVariations } from 'calypso/data/marketplace/types';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { default as isVipSite } from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { canPublishThemeReview } from 'calypso/state/themes/selectors/can-publish-theme-review';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isMarketplaceProduct } from '../products-list/selectors';

/*
 * shouldUpgradeCheck:
 * Does the selected blog need an upgrade before installing marketplace addons?
 * If it's missing the WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS, shouldUpgradeCheck returns true,
 * except standalone jetpack and VIP sites always return false.
 */
const shouldUpgradeCheck = ( state: IAppState, siteId: number | null ): boolean | null => {
	if ( ! siteId ) {
		return null;
	}
	const canInstallPurchasedPlugins = siteHasFeature(
		state,
		siteId,
		WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
	);
	const isStandaloneJetpack =
		isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId );
	const isVip = isVipSite( state, siteId );
	return ! canInstallPurchasedPlugins && ! isStandaloneJetpack && ! isVip;
};

export default shouldUpgradeCheck;

/*
 * hasOrIntendsToBuyLiveSupport:
 * - Does the selected blog already have a plan or product providing the LIVE_SUPPORT feature?
 * OR
 * - Does the user need to purchase an upgrade before installing Marketplace Addons
 * and do they have the Annual purchase selected?
 *   ( We assume this means they'll be buying a plan that includes Live Support ).
 */
export const hasOrIntendsToBuyLiveSupport = ( state: IAppState ): boolean => {
	const siteId = getSelectedSiteId( state );

	const hasLiveSupport = siteHasFeature( state, siteId, WPCOM_FEATURES_LIVE_SUPPORT );
	const needsUpgrade = shouldUpgradeCheck( state, siteId );

	if ( needsUpgrade ) {
		/**
		 * We need to upgrade plans to buy a marketplace addon.
		 *
		 * We don't know exactly what plan we're buying, but we do know if the
		 * user has "monthly" or "yearly" selected in the top right.
		 * Assume that "yearly" means that they'll get Live Support.
		 *
		 * If they already have live support, or if they are looking at annual
		 * plans, return true.
		 */
		const billingPeriod = getBillingInterval( state );
		// This refers to the top right [ Monthly ] [ Annual ] selection.
		const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;
		return isAnnualPeriod || hasLiveSupport;
	}

	// We do not need to upgrade. Return if we have live support directly.
	return hasLiveSupport;
};

export function canPublishProductReviews(
	state: IAppState,
	productType: string,
	productSlug: string,
	variations?: PluginPeriodVariations
) {
	if ( productType === 'theme' ) {
		return canPublishThemeReview( state, productSlug );
	}
	if ( productType === 'plugin' ) {
		return canPublishPluginReview( state, productSlug, variations );
	}
	throw new Error( `Unknown product type: ${ productType }` );
}

export function canPublishPluginReview(
	state: IAppState,
	pluginSlug: string,
	variations?: PluginPeriodVariations
) {
	const isMarketplacePlugin = isMarketplaceProduct( state, pluginSlug );
	const isLoggedIn = isUserLoggedIn( state );

	const hasActiveSubscription = hasActivePluginSubscription( state, variations );

	return isLoggedIn && ( ! isMarketplacePlugin || hasActiveSubscription );
}

export function hasActivePluginSubscription(
	state: IAppState,
	variations?: PluginPeriodVariations
) {
	const purchases = getUserPurchases( state );
	const purchasedPlugin = getPluginPurchased( { variations }, purchases || [] );
	const hasActiveSubscription = !! purchasedPlugin;

	return hasActiveSubscription;
}
