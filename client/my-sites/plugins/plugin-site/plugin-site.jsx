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

function mapStateToProps( state, ownProps ) {
	const siteId = get( ownProps, 'site.ID' );
	return {
		isAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
	};
}

function mergeProps( stateProps, dispatchProps, ownProps ) {
	const pluginSlug = get( ownProps, 'plugin.slug' );
	let overrides = {};

	if ( includes( [ 'jetpack', 'vaultpress' ], pluginSlug ) && stateProps.isAutomatedTransfer ) {
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
