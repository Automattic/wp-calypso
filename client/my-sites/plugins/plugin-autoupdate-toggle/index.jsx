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
	analytics = require( 'analytics' );

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
			return array( this.translate( 'This plugin is not in the WordPress.org plugin repository, so we can\'t autoupdate it.' ) );
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

		let reasons = [];
		if ( ! this.props.site.canUpdateFiles && this.props.site.options.file_mod_disabled ) {
			for ( let clue of this.props.site.options.file_mod_disabled ) {
				switch ( clue ) {
					case 'is_version_controlled':
						reasons.push(
							this.translate( '%(site)s is under version control, so we can\'t autoupdate plugins.', {
								args: { site: this.props.site.title }
							} )
						);
						break;
					case 'has_no_file_system_write_access':
						reasons.push(
							this.translate( 'The file access permissions on this server prevent us from autoupdating plugins.', {
								args: { site: this.props.site.title }
							} )
						);
						break;
					case 'automatic_updater_disabled':
						reasons.push(
							this.translate( 'The administrator of %(site)s has explicitly disabled any autoupdates.', {
								args: { site: this.props.site.title }
							} )
						);
						break;
					case 'wp_auto_update_core_disabled':
						reasons.push(
							this.translate( 'The administrator of %(site)s has explicitly disabled core autoupdates.', {
								args: { site: this.props.site.title }
							} )
						);
						break;
					case 'disallow_file_edit':
						reasons.push(
							this.translate( 'The administrator of %(site)s has explicitly prevented file edits.', {
								args: { site: this.props.site.title }
							} )
						);
						break;
					case 'disallow_file_mods':
						reasons.push(
							this.translate( 'The administrator of %(site)s has explicitly prevented file modifications.', {
								args: { site: this.props.site.title }
							} )
						);
						break;
				}
			}
			reasons.push( <ExternalLink href="https://jetpack.me/support/site-management/#file-update-disabled" >{ this.translate( 'How to fix it?' ) }</ExternalLink> );
			return reasons.map( ( reason, i ) => ( <p key={ i } > { reason }</p> ) );
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
