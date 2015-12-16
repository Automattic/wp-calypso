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
	DisconnectJetpackButton = require( 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {

	displayName: 'PluginActivateToggle',

	propTypes: {
		isMock: React.PropTypes.bool,
		site: React.PropTypes.object.isRequired,
		plugin: React.PropTypes.object.isRequired,
	},

	toggleActivation: function() {
		if ( this.props.isMock || this.props.disabled ) {
			return;
		}

		PluginsActions.togglePluginActivation( this.props.site, this.props.plugin );
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );

		if ( this.props.plugin.active ) {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Deactivate Plugin', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_deactivate_click', {
				site: this.props.site.ID,
				plugin: this.props.plugin.slug
			} );
		} else {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Activate Plugin', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_activate_click', {
				site: this.props.site.ID,
				plugin: this.props.plugin.slug
			} );
		}
	},

	render: function() {
		var inProgress;

		if ( ! this.props.site ) {
			return null;
		}

		inProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, [
			'ACTIVATE_PLUGIN',
			'DEACTIVATE_PLUGIN'
		] );

		if ( this.props.plugin && 'jetpack' === this.props.plugin.slug ) {
			return (
				<PluginAction
					className="plugin-activate-toggle"
					htmlFor={ 'disconnect-jetpack-' + this.props.site.ID }
					>
					<DisconnectJetpackButton
						disabled={ this.props.disabled || ! this.props.plugin }
						site={ this.props.site }
						redirect="/plugins/jetpack"
						/>
				</PluginAction>
			);
		}
		return (
			<PluginAction
				disabled={ this.props.disabled }
				className="plugin-activate-toggle"
				label={ this.translate( 'Active', { context: 'plugin status' } ) }
				inProgress={ inProgress }
				status={ this.props.plugin && this.props.plugin.active }
				action={ this.toggleActivation }
				htmlFor={ 'activate-' + this.props.plugin.slug + '-' + this.props.site.ID }
				/>
		);
	}
} );
