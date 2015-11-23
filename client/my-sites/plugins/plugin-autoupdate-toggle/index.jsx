/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginsActions = require( 'lib/plugins/actions' ),
	PluginsLog = require( 'lib/plugins/log-store' ),
	PluginAction = require( 'my-sites/plugins/plugin-action/plugin-action' ),
	ExternalLink = require( 'components/external-link' ),
	analytics = require( 'analytics' ),
	utils = require( 'lib/site/utils' );

module.exports = React.createClass( {

	displayName: 'PluginAutopdateToggle',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		plugin: React.PropTypes.object.isRequired,
		wporg: React.PropTypes.bool
	},

	toggleAutoupdates: function() {
		PluginsActions.togglePluginAutoUpdate( this.props.site, this.props.plugin );
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );

		if ( this.props.plugin.autoupdate ) {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Disable Autoupdates Plugin', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_autoupdate_disable_click', {
				site: this.props.site.ID,
				plugin: this.props.plugin.slug
			} );
		} else {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Enable Autoupdates Plugin', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_autoupdate_enable_click', {
				site: this.props.site.ID,
				plugin: this.props.plugin.slug
			} );
		}
	},

	getDisabledInfo: function() {
		if ( ! this.props.site ) { // we don't have enough info
			return null;
		}

		if ( ! this.props.wporg ) {
			return this.translate( 'This plugin is not in the WordPress.org plugin repository, so we can\'t autoupdate it.' );
		}

		if ( ! this.props.site.hasMinimumJetpackVersion ) {
			return this.translate( '%(site)s is not running an up to date version of Jetpack', {
				args: { site: this.props.site.title }
			} );
		}

		if ( this.props.site.options.is_multi_network ) {
			return this.translate( '%(site)s is part of a multi-network installation and is therefore not supported.', {
				args: { site: this.props.site.title }
			} );
		}

		if ( this.props.site.options.unmapped_url !== this.props.site.options.main_network_site ) {
			return this.translate( 'Only the main site on a multi-site installation can enable autoupdates for plugins.', {
				args: { site: this.props.site.title }
			} );
		}


		if ( ! this.props.site.canUpdateFiles && this.props.site.options.file_mod_disabled ) {
			let reasons = utils.getSiteFileModDisableReason( this.props.site );
			let html = [];

			if ( reasons.length > 1 ) {
				html.push( <p> { this.translate( 'Autoupdates are not available for %(site)s:', { args: { site: this.props.site.title } }
						 ) } </p> );
				let list = reasons.map( ( reason, i ) => ( <li key={ i } >{ reason }</li> ) );
				html.push( <ul className="plugin-action__disabled-info-list">{ list }</ul> );
			} else {
				html.push( <p> {
					this.translate( 'Autoupdates are not available for %(site)s.', {
						args: { site: this.props.site.title }
					} )
					} { reasons[0] } </p> );
			}
			html.push( <ExternalLink href="https://jetpack.me/support/site-management/#file-update-disabled" >{ this.translate( 'How to fix it?' ) }</ExternalLink> );

			return html;
		}
		return null;
	},

	render: function() {
		const inProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, [
				'ENABLE_AUTOUPDATE_PLUGIN',
				'DISABLE_AUTOUPDATE_PLUGIN'
			] ),
			getDisabledInfo = this.getDisabledInfo(),
			label = getDisabledInfo
				? this.translate( 'Autoupdates disabled', {
					context: 'this goes next to an icon that displays if the plugin has "autoupdates disabled" active'
				} )
				: this.translate( 'Autoupdates', {
					context: 'this goes next to an icon that displays if the plugin has "autoupdates" active'
				} );

		return (
			<PluginAction
				label={ label }
				status={ this.props.plugin.autoupdate }
				action={ this.toggleAutoupdates }
				inProgress={ inProgress }
				disabledInfo={ getDisabledInfo }
				htmlFor={ 'autoupdates-' + this.props.plugin.slug + '-' + this.props.site.ID } />
		);
	}
} );
