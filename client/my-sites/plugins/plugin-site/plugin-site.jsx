/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginSiteJetpack = require( 'my-sites/plugins/plugin-site-jetpack' ),
	PluginSiteNetwork = require( 'my-sites/plugins/plugin-site-network' ),
	PluginSiteBusiness = require( 'my-sites/plugins/plugin-site-business' );

module.exports = React.createClass( {

	displayName: 'PluginSite',

	render: function() {
		if ( ! this.props.site ) {
			return;
		}

		if ( ! this.props.wporg ) {
			return <PluginSiteBusiness { ...this.props } />;
		}

		if ( this.props.site.jetpack && this.props.secondarySites && this.props.secondarySites.length ) {
			return <PluginSiteNetwork { ...this.props } />;
		}

		return <PluginSiteJetpack { ...this.props } />;
	}
} );
