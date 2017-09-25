/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

import Gridicon from 'gridicons';
import PluginsActions from 'lib/plugins/actions';

export default localize( React.createClass( {

	displayName: 'PluginSiteUpdateIndicator',

	propTypes: {
		site: PropTypes.shape( {
			canUpdateFiles: PropTypes.bool.isRequired,
			ID: PropTypes.number.isRequired
		} ),
		plugin: PropTypes.shape( { slug: PropTypes.string } ),
		notices: PropTypes.object.isRequired,
		expanded: PropTypes.bool
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
			message = this.props.translate( 'Updating to version %(version)s', {
				args: { version: ongoingUpdates[ 0 ].plugin.update.new_version }
			} );
		} else {
			message = this.props.translate( 'Update to %(version)s', {
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

} ) );
