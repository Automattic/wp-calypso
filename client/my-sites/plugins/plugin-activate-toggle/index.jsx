import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { ACTIVATE_PLUGIN, DEACTIVATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { getManageConnectionHref } from 'calypso/lib/plugins/utils';
import PluginAction from 'calypso/my-sites/plugins/plugin-action/plugin-action';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { togglePluginActivation } from 'calypso/state/plugins/installed/actions';
import { isPluginActionInProgress } from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';

import './style.scss';

const activationActions = [ ACTIVATE_PLUGIN, DEACTIVATE_PLUGIN ];

export class PluginActivateToggle extends Component {
	toggleActivation = () => {
		const {
			disabled,
			site,
			plugin,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;
		if ( disabled ) {
			return;
		}

		this.props.togglePluginActivation( site.ID, plugin );
		this.props.removePluginStatuses( 'completed', 'error', 'up-to-date' );

		if ( plugin.active ) {
			recordGAEvent( 'Plugins', 'Clicked Toggle Deactivate Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_active_toggle_click', {
				site: site.ID,
				plugin: plugin.slug,
				state: 'inactive',
			} );
		} else {
			recordGAEvent( 'Plugins', 'Clicked Toggle Activate Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_active_toggle_click', {
				site: site.ID,
				plugin: plugin.slug,
				state: 'active',
			} );
		}
	};

	trackManageConnectionLink = () => {
		const {
			site,
			plugin,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;
		recordGAEvent( 'Plugins', 'Clicked Manage Jetpack Connection Link', 'Plugin Name', 'jetpack' );
		recordEvent( 'calypso_plugin_manage_connection_click', {
			site: site.ID,
			plugin: plugin.slug,
		} );
	};

	manageConnectionLink() {
		const { disabled, translate, site } = this.props;
		if ( disabled ) {
			return (
				<span className="plugin-activate-toggle__disabled">
					<span className="plugin-activate-toggle__icon">
						<Gridicon icon="cog" size={ 18 } />
					</span>
					<span className="plugin-activate-toggle__label">
						{ translate( 'Manage Connection', {
							comment: 'manage Jetpack connnection settings link',
						} ) }
					</span>
				</span>
			);
		}

		return (
			<span className="plugin-activate-toggle__link">
				<a
					className="plugin-activate-toggle__icon"
					onClick={ this.trackManageConnectionLink }
					href={ getManageConnectionHref( site.slug ) }
				>
					<Gridicon icon="cog" size={ 18 } />
				</a>
				<a
					className="plugin-activate-toggle__label"
					onClick={ this.trackManageConnectionLink }
					href={ getManageConnectionHref( site.slug ) }
				>
					{ translate( 'Manage Connection', {
						comment: 'manage Jetpack connnection settings link',
					} ) }
				</a>
			</span>
		);
	}

	render() {
		const { inProgress, site, plugin, disabled, translate, hideLabel, isJetpackCloud } = this.props;

		if ( ! site ) {
			return null;
		}

		const isJetpackPlugin = plugin && 'jetpack' === plugin.slug;

		if ( ! isJetpackCloud && isJetpackPlugin ) {
			return (
				<PluginAction
					className="plugin-activate-toggle"
					htmlFor={ 'disconnect-jetpack-' + site.ID }
				>
					{ this.manageConnectionLink() }
				</PluginAction>
			);
		}
		return (
			<PluginAction
				disabled={ disabled || isJetpackPlugin }
				className="plugin-activate-toggle"
				label={ translate( 'Active', { context: 'plugin status' } ) }
				inProgress={ inProgress }
				status={ plugin && plugin.active }
				action={ this.toggleActivation }
				htmlFor={ 'activate-' + plugin.slug + '-' + site.ID }
				hideLabel={ hideLabel }
			/>
		);
	}
}

PluginActivateToggle.propTypes = {
	site: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
};

PluginActivateToggle.defaultProps = {
	disabled: false,
};

export default connect(
	( state, { site, plugin } ) => ( {
		inProgress: plugin && isPluginActionInProgress( state, site.ID, plugin.id, activationActions ),
	} ),
	{
		recordGoogleEvent,
		recordTracksEvent,
		removePluginStatuses,
		togglePluginActivation,
	}
)( localize( PluginActivateToggle ) );
