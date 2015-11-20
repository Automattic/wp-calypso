/**
 * External dependencies
 */
var React = require( 'react' ),
	config = require( 'config' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	accept = require( 'lib/accept' ),
	Gridicon = require( 'components/gridicon' ),
	PluginsLog = require( 'lib/plugins/log-store' ),
	PluginAction = require( 'my-sites/plugins/plugin-action/plugin-action' ),
	PluginsActions = require( 'lib/plugins/actions' );

module.exports = React.createClass( {

	displayName: 'PluginRemoveButton',

	removeAction: function() {
		accept(
			this.translate( 'Are you sure you want to remove {{strong}}%(pluginName)s{{/strong}} from %(siteName)s? {{br /}} {{em}}This will deactivate the plugin and delete all associated files and data.{{/em}}', {
				components: {
					em: <em />,
					br: <br />,
					strong: <strong />
				},
				args: {
					pluginName: this.props.plugin.name,
					siteName: this.props.site.title
				}
			} ),
			this.processRemovalConfirmation,
			this.translate( 'Remove' )
		);
	},

	processRemovalConfirmation: function( accepted ) {
		if ( accepted ) {
			PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
			PluginsActions.removePlugin( this.props.site, this.props.plugin );

			if ( this.props.isEmbed ) {
				analytics.ga.recordEvent( 'Plugins', 'Remove plugin with no selected site', 'Plugin Name', this.props.plugin.slug );
				analytics.tracks.recordEvent( 'calypso_plugin_remove_click_from_sites_list', {
					site: this.props.site,
					plugin: this.props.plugin.slug
				} );
			} else {
				analytics.ga.recordEvent( 'Plugins', 'Remove plugin on selected Site', 'Plugin Name', this.props.plugin.slug );
				analytics.tracks.recordEvent( 'calypso_plugin_remove_click_from_plugin_info', {
					site: this.props.site,
					plugin: this.props.plugin.slug
				} );
			}
		}
	},

	renderButton: function() {
		var inProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, [ 'REMOVE_PLUGIN' ] );

		if ( inProgress ) {
			return (
				<span className="plugin-action plugin-remove-button__remove">
					{ this.translate( 'Removing…' ) }
				</span>
			);
		}
		return (
			<PluginAction
					label={ this.translate( 'Remove', { context: 'Verb. Presented to user as a label for a button.' } ) }
					htmlFor={ 'remove-plugin-' + this.props.site.ID }
					action={ this.removeAction }
					className="plugin-remove-button__remove-link"
					>
						<a onClick={ this.removeAction } >
							<Gridicon icon="trash" size={ 18 } />
						</a>
				</PluginAction>
		);
	},

	render: function() {
		if ( ! this.props.site.canUpdateFiles ||
				this.props.plugin.slug === 'jetpack' ||
				! config.isEnabled( 'manage/plugins/browser' ) ) {
			return null;
		}

		return this.renderButton();
	}
} );

