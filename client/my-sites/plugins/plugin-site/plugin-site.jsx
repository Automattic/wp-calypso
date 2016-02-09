/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginSiteJetpack = require( 'my-sites/plugins/plugin-site-jetpack' ),
	PluginSiteNetwork = require( 'my-sites/plugins/plugin-site-network' );

module.exports = React.createClass( {

	displayName: 'PluginSite',

	render: function() {
		if ( ! this.props.site ) {
			return null;
		}

		if ( this.props.site.jetpack && this.props.secondarySites && this.props.secondarySites.length ) {
			return <PluginSiteNetwork { ...this.props } />;
		}

		return <PluginSiteJetpack { ...this.props } />;
	}
} );
