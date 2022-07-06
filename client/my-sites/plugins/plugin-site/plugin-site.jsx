import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products/src';
import { get } from 'lodash';
import { connect } from 'react-redux';
import PluginSiteJetpack from 'calypso/my-sites/plugins/plugin-site-jetpack';
import PluginSiteNetwork from 'calypso/my-sites/plugins/plugin-site-network';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';

const PluginSite = ( props ) => {
	if ( ! props.site ) {
		return null;
	}

	if ( props.plugin.isMarketplaceProduct && ! props.isWPCOM ) {
		return null;
	}

	if ( props.site.jetpack && props.secondarySites && props.secondarySites.length ) {
		return <PluginSiteNetwork { ...props } />;
	}

	return <PluginSiteJetpack { ...props } />;
};

function mapStateToProps( state, ownProps ) {
	// This logic is duplicated from plugins-list/index.jsx,
	// possibly extract in future.
	const siteId = get( ownProps, 'site.ID' );
	const pluginSlug = get( ownProps, 'plugin.slug' );

	const siteIsAtomic = isAtomicSite( state, siteId );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const jetpackNonAtomic = siteIsJetpack && ! siteIsAtomic;

	const hasManagePlugins =
		siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS ) || jetpackNonAtomic;

	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const isManagedPlugin = siteIsAtomic && autoManagedPlugins.includes( pluginSlug );
	const canManagePlugins =
		( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

	return {
		isAutomatedTransfer: siteIsAtomic,
		isWPCOM: getIsSiteWPCOM( state, siteId ),
		allowedActions: {
			autoupdate: ! isManagedPlugin && canManagePlugins,
			activation: ! isManagedPlugin && canManagePlugins,
			remove: ! isManagedPlugin && canManagePlugins,
		},
		isAutoManaged: isManagedPlugin,
	};
}

export default connect( mapStateToProps )( PluginSite );
