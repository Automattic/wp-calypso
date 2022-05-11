import { FEATURE_INSTALL_PLUGINS, WPCOM_FEATURES_LIVE_SUPPORT } from '@automattic/calypso-products';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { default as isVipSite } from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const shouldUpgradeCheck = ( state: IAppState, siteId: number | null ) => {
	if ( ! siteId ) {
		return null;
	}
	const canInstallPlugins = siteHasFeature( state, siteId, FEATURE_INSTALL_PLUGINS );
	const isStandaloneJetpack =
		isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId );
	const isVip = isVipSite( state, siteId );
	return ! canInstallPlugins && ! isStandaloneJetpack && ! isVip;
};

export const isAnnualPlanOrUpgradeableAnnualPeriod = ( state: IAppState ) => {
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

export default shouldUpgradeCheck;
