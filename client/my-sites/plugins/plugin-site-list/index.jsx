/**
 * External dependencies
 */
import { compact } from 'lodash';
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var allSites = require( 'lib/sites-list' )(),
	PluginSite = require( 'my-sites/plugins/plugin-site/plugin-site' ),
	SectionHeader = require( 'components/section-header' ),
	PluginsStore = require( 'lib/plugins/store' );

module.exports = React.createClass( {

	displayName: 'PluginSiteList',

	propTypes: {
		site: React.PropTypes.object,
		plugin: React.PropTypes.object,
		notices: React.PropTypes.object,
		title: React.PropTypes.string
	},

	getSecondaryPluginSites: function( site ) {
		let secondarySites = allSites.getNetworkSites( site );
		let secondaryPluginSites = site.plugin
			? PluginsStore.getSites( secondarySites, this.props.plugin.slug )
			: secondarySites;
		return compact( secondaryPluginSites );
	},

	renderPluginSite: function( site ) {
		return <PluginSite
				key={ 'pluginSite' + site.ID }
				site={ site }
				secondarySites={ this.getSecondaryPluginSites( site ) }
				plugin={ this.props.plugin }
				wporg={ this.props.wporg }
				notices={ this.props.notices } />;
	},

	render: function() {
		if ( ! this.props.sites || this.props.sites.length === 0 ) {
			return null;
		}
		const classes = classNames( 'plugin-site-list', this.props.className ),
			pluginSites = this.props.sites.map( function( site ) {
				if ( allSites.isConnectedSecondaryNetworkSite( site ) ) {
					return;
				}

				return this.renderPluginSite( site );
			}, this );

		return (
			<div className={ classes } >
				<SectionHeader label={ this.props.title } />
				{ pluginSites }
			</div>
		);
	}
} );
