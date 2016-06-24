/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	Gridicon = require( 'components/gridicon' ),
	PluginsActions = require( 'lib/plugins/actions' );

module.exports = React.createClass( {

	displayName: 'PluginSiteUpdateIndicator',

	propTypes: {
		site: React.PropTypes.shape( {
			canUpdateFiles: React.PropTypes.bool.isRequired,
			ID: React.PropTypes.number.isRequired
		} ),
		plugin: React.PropTypes.shape( { slug: React.PropTypes.string } ),
		notices: React.PropTypes.object.isRequired,
		expanded: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return { expanded: false };
	},

	updatePlugin: function( ev ) {
		ev.stopPropagation();

		PluginsActions.updatePlugin( this.props.site, this.props.plugin );
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
		analytics.ga.recordEvent( 'Plugins', 'Clicked Update Single Site Plugin', 'Plugin Name', this.props.plugin.slug );
		analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.site.ID,
			plugin: this.props.plugin.slug
		} );
	},

	getOngoingUpdates: function() {
		return this.props.notices.inProgress.filter( log =>log.site.ID === this.props.site.ID && log.action === 'UPDATE_PLUGIN' );
	},

	isUpdating: function() {
		return this.getOngoingUpdates().length > 0;
	},

	renderUpdate: function() {
		let message,
			ongoingUpdates = this.getOngoingUpdates(),
			isUpdating = ongoingUpdates.length > 0;

		if ( isUpdating ) {
			message = this.translate( 'Updating to version %(version)s', {
				args: { version: ongoingUpdates[ 0 ].plugin.update.new_version }
			} );
		} else {
			message = this.translate( 'Update to %(version)s', {
				args: { version: this.props.site.plugin.update.new_version }
			} );
		}
		return (
			<div className="plugin-site-update-indicator__button">
				<button className="button" ref="updatePlugin" onClick={ this.updatePlugin } disabled={ isUpdating }>
					{ message }
				</button>
			</div>
		);
	},

	render: function() {
		if ( ! this.props.site || ! this.props.plugin ) {
			return;
		}
		if ( this.props.site.canUpdateFiles &&
				( ( this.props.site.plugin.update && ! this.props.site.plugin.update.recentlyUpdated ) || this.isUpdating() ) ) {
			if ( ! this.props.expanded ) {
				/* eslint-disable wpcalypso/jsx-gridicon-size */
				return <span className="plugin-site-update-indicator"><Gridicon icon="sync" size={ 20 } /></span>;
				/* eslint-enable wpcalypso/jsx-gridicon-size */
			}

			return this.renderUpdate();
		}
		return null;
	}

} );
