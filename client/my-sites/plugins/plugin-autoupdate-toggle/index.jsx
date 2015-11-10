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
			return this.translate( 'This Plugin is not part of the WordPress.org plugin reposetory. We cannot verify its updates.' );
		}

		if ( ! this.props.site.canUpdateFiles ) {
			return this.translate( '%(site)s doesn\'t have the right permission to update files.', {
				args: { site: this.props.site.title }
			} );
		}

		if ( this.props.site.options.file_mod_disabled ) {
			return this.translate( '%(site)s doesn\'t have the ability to modify files.', {
				args: { site: this.props.site.title }
			} );
		}

		return null;
	},

	render: function() {
		var inProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, [
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
