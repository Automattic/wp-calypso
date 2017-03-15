/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import PluginSiteJetpack from 'my-sites/plugins/plugin-site-jetpack';
import PluginSiteNetwork from 'my-sites/plugins/plugin-site-network';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

const PluginSite = ( props ) => {
	if ( ! props.site ) {
		return null;
	}

	if ( props.site.jetpack && props.secondarySites && props.secondarySites.length ) {
		return <PluginSiteNetwork { ...props } />;
	}

	return <PluginSiteJetpack { ...props } />;
};

export default connect(
	( state, ownProps ) => {
		const pluginSlug = get( ownProps, 'plugin.slug' );
		const siteId = get( ownProps, 'site.ID' );

		if ( includes( [ 'jetpack', 'vaultpress' ], pluginSlug ) && isSiteAutomatedTransfer( state, siteId ) ) {
			return {
				...ownProps,
				...{
					allowedActions: {
						activation: false,
						autoupdate: false,
						remove: false,
					}
				},
			};
		}
		return ownProps;
	}
)( PluginSite );
