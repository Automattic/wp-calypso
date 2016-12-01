/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PluginSiteJetpack from 'my-sites/plugins/plugin-site-jetpack';
import PluginSiteNetwork from 'my-sites/plugins/plugin-site-network';

const PluginSite = ( props ) => {
	if ( ! props.site ) {
		return null;
	}

	if ( props.site.jetpack && props.secondarySites && props.secondarySites.length ) {
		return <PluginSiteNetwork { ...props } />;
	}

	return <PluginSiteJetpack { ...props } />;
};

export default PluginSite;
