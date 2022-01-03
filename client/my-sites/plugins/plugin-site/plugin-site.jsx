import { get } from 'lodash';
import { connect } from 'react-redux';
import PluginSiteJetpack from 'calypso/my-sites/plugins/plugin-site-jetpack';
import PluginSiteNetwork from 'calypso/my-sites/plugins/plugin-site-network';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';

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
	const siteId = get( ownProps, 'site.ID' );
	return {
		isAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
		isWPCOM: getIsSiteWPCOM( state, siteId ),
	};
}

function mergeProps( stateProps, dispatchProps, ownProps ) {
	const pluginSlug = get( ownProps, 'plugin.slug' );
	let overrides = {};

	if ( [ 'jetpack', 'vaultpress' ].includes( pluginSlug ) && stateProps.isAutomatedTransfer ) {
		overrides = {
			allowedActions: {
				activation: false,
				autoupdate: false,
				remove: false,
			},
			isAutoManaged: true,
		};
	}
	return Object.assign( {}, ownProps, stateProps, dispatchProps, overrides );
}

export default connect( mapStateToProps, null, mergeProps )( PluginSite );
