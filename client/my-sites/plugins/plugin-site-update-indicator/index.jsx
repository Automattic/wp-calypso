import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { updatePlugin } from 'calypso/state/plugins/installed/actions';
import {
	getPluginOnSite,
	getPluginStatusesByType,
} from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';

import './style.scss';

class PluginSiteUpdateIndicator extends Component {
	static displayName = 'PluginSiteUpdateIndicator';

	static propTypes = {
		site: PropTypes.shape( {
			canUpdateFiles: PropTypes.bool.isRequired,
			ID: PropTypes.number.isRequired,
		} ),
		plugin: PropTypes.shape( { slug: PropTypes.string } ),
		expanded: PropTypes.bool,
	};

	static defaultProps = { expanded: false };

	updatePlugin = ( ev ) => {
		ev.stopPropagation();

		this.props.updatePlugin( this.props.site.ID, this.props.plugin );
		this.props.removePluginStatuses( 'completed', 'error' );
		gaRecordEvent(
			'Plugins',
			'Clicked Update Single Site Plugin',
			'Plugin Name',
			this.props.plugin.slug
		);
		recordTracksEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.site.ID,
			plugin: this.props.plugin.slug,
		} );
	};

	getOngoingUpdates = () => {
		if ( ! this.props.pluginOnSite?.update?.new_version ) {
			return [];
		}

		return this.props.inProgressStatuses.filter(
			( status ) =>
				parseInt( status.siteId ) === this.props.site.ID && status.action === UPDATE_PLUGIN
		);
	};

	isUpdating = () => {
		return this.getOngoingUpdates().length > 0;
	};

	renderUpdate = () => {
		let message;
		const ongoingUpdates = this.getOngoingUpdates();
		const isUpdating = ongoingUpdates.length > 0;

		if ( isUpdating ) {
			message = this.props.translate( 'Updating to version %(version)s', {
				args: { version: this.props.pluginOnSite.update.new_version },
			} );
		} else {
			message = this.props.translate( 'Update to %(version)s', {
				args: { version: this.props.pluginOnSite.update.new_version },
			} );
		}

		if ( this.props.menuItem ) {
			return <PopoverMenuItem onClick={ this.updatePlugin }>{ message }</PopoverMenuItem>;
		}

		return (
			<div className="plugin-site-update-indicator__button-container">
				<button
					className="plugin-site-update-indicator__button button"
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
			( ( this.props.pluginOnSite.update && ! this.props.pluginOnSite.update.recentlyUpdated ) ||
				this.isUpdating() )
		) {
			if ( ! this.props.expanded ) {
				/* eslint-disable wpcalypso/jsx-gridicon-size */
				return (
					<span className="plugin-site-update-indicator__icon">
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

export default connect(
	( state, { plugin, site } ) => ( {
		inProgressStatuses: getPluginStatusesByType( state, 'inProgress' ),
		pluginOnSite: getPluginOnSite( state, site.ID, plugin.slug ),
	} ),
	{ removePluginStatuses, updatePlugin }
)( localize( PluginSiteUpdateIndicator ) );
