/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { gaRecordEvent } from 'lib/analytics/ga';
import Gridicon from 'components/gridicon';
import PluginsActions from 'lib/plugins/actions';

/**
 * Style dependencies
 */
import './style.scss';

class PluginSiteUpdateIndicator extends React.Component {
	static displayName = 'PluginSiteUpdateIndicator';

	static propTypes = {
		site: PropTypes.shape( {
			canUpdateFiles: PropTypes.bool.isRequired,
			ID: PropTypes.number.isRequired,
		} ),
		plugin: PropTypes.shape( { slug: PropTypes.string } ),
		notices: PropTypes.object.isRequired,
		expanded: PropTypes.bool,
	};

	static defaultProps = { expanded: false };

	updatePlugin = ev => {
		ev.stopPropagation();

		PluginsActions.updatePlugin( this.props.site, this.props.plugin );
		PluginsActions.removePluginsNotices( 'completed', 'error' );
		gaRecordEvent(
			'Plugins',
			'Clicked Update Single Site Plugin',
			'Plugin Name',
			this.props.plugin.slug
		);
		analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.site.ID,
			plugin: this.props.plugin.slug,
		} );
	};

	getOngoingUpdates = () => {
		return this.props.notices.inProgress.filter(
			log => log.site.ID === this.props.site.ID && log.action === 'UPDATE_PLUGIN'
		);
	};

	isUpdating = () => {
		return this.getOngoingUpdates().length > 0;
	};

	renderUpdate = () => {
		let message,
			ongoingUpdates = this.getOngoingUpdates(),
			isUpdating = ongoingUpdates.length > 0;

		if ( isUpdating ) {
			message = this.props.translate( 'Updating to version %(version)s', {
				args: { version: ongoingUpdates[ 0 ].plugin.update.new_version },
			} );
		} else {
			message = this.props.translate( 'Update to %(version)s', {
				args: { version: this.props.site.plugin.update.new_version },
			} );
		}
		return (
			<div className="plugin-site-update-indicator__button">
				<button
					className="button"
					ref="updatePlugin"
					onClick={ this.updatePlugin }
					disabled={ isUpdating }
				>
					{ message }
				</button>
			</div>
		);
	};

	render() {
		if ( ! this.props.site || ! this.props.plugin ) {
			return;
		}
		if (
			this.props.site.canUpdateFiles &&
			( ( this.props.site.plugin.update && ! this.props.site.plugin.update.recentlyUpdated ) ||
				this.isUpdating() )
		) {
			if ( ! this.props.expanded ) {
				/* eslint-disable wpcalypso/jsx-gridicon-size */
				return (
					<span className="plugin-site-update-indicator">
						<Gridicon icon="sync" size={ 20 } />
					</span>
				);
				/* eslint-enable wpcalypso/jsx-gridicon-size */
			}

			return this.renderUpdate();
		}
		return null;
	}
}

export default localize( PluginSiteUpdateIndicator );
