import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { AppState } from 'calypso/types';

export const getAllowedPluginActions = (
	plugin: Plugin,
	state: AppState,
	selectedSite?: SiteData
) => {
	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const siteIsAtomic = selectedSite && isSiteAutomatedTransfer( state, selectedSite?.ID );
	const siteIsJetpack = selectedSite && isJetpackSite( state, selectedSite?.ID );
	const hasManagePlugins =
		selectedSite && siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS );
	const isManagedPlugin = siteIsAtomic && autoManagedPlugins.includes( plugin.slug );
	const canManagePlugins =
		! selectedSite || ( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

	return {
		autoupdate: ! isManagedPlugin && canManagePlugins,
		activation: ! isManagedPlugin && canManagePlugins,
	};
};
