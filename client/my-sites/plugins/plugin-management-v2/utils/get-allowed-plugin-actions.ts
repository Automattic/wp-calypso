import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { Plugin } from '../types';

export const getAllowedPluginActions = ( plugin: Plugin, state, selectedSite ) => {
	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const siteIsAtomic = isSiteAutomatedTransfer( state, selectedSite?.ID );
	const siteIsJetpack = isJetpackSite( state, selectedSite?.ID );
	const hasManagePlugins = siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS );
	const isManagedPlugin = siteIsAtomic && autoManagedPlugins.includes( plugin.slug );
	const canManagePlugins =
		! selectedSite || ( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

	return {
		autoupdate: ! isManagedPlugin && canManagePlugins,
		activation: ! isManagedPlugin && canManagePlugins,
	};
};
