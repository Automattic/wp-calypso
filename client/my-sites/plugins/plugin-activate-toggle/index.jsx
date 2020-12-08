/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import PluginsActions from 'calypso/lib/plugins/actions';
import PluginsLog from 'calypso/lib/plugins/log-store';
import PluginAction from 'calypso/my-sites/plugins/plugin-action/plugin-action';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

export class PluginActivateToggle extends Component {
	toggleActivation = () => {
		const {
			isMock,
			disabled,
			site,
			plugin,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;
		if ( isMock || disabled ) {
			return;
		}

		PluginsActions.togglePluginActivation( site, plugin );
		PluginsActions.removePluginsNotices( 'completed', 'error' );

		if ( plugin.active ) {
			recordGAEvent( 'Plugins', 'Clicked Toggle Deactivate Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_deactivate_click', {
				site: site.ID,
				plugin: plugin.slug,
			} );
		} else {
			recordGAEvent( 'Plugins', 'Clicked Toggle Activate Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_activate_click', {
				site: site.ID,
				plugin: plugin.slug,
			} );
		}
	};

	trackManageConnectionLink = () => {
		const { recordGoogleEvent: recordGAEvent } = this.props;
		recordGAEvent( 'Plugins', 'Clicked Manage Jetpack Connection Link', 'Plugin Name', 'jetpack' );
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
					href={ '/settings/manage-connection/' + site.slug }
				>
					<Gridicon icon="cog" size={ 18 } />
				</a>
				<a
					className="plugin-activate-toggle__label"
					onClick={ this.trackManageConnectionLink }
					href={ '/settings/manage-connection/' + site.slug }
				>
					{ translate( 'Manage Connection', {
						comment: 'manage Jetpack connnection settings link',
					} ) }
				</a>
			</span>
		);
	}

	render() {
		const { site, plugin, disabled, translate } = this.props;

		if ( ! site ) {
			return null;
		}

		const inProgress = PluginsLog.isInProgressAction( site.ID, plugin.slug, [
			'ACTIVATE_PLUGIN',
			'DEACTIVATE_PLUGIN',
		] );

		if ( plugin && 'jetpack' === plugin.slug ) {
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
				disabled={ disabled }
				className="plugin-activate-toggle"
				label={ translate( 'Active', { context: 'plugin status' } ) }
				inProgress={ inProgress }
				status={ plugin && plugin.active }
				action={ this.toggleActivation }
				htmlFor={ 'activate-' + plugin.slug + '-' + site.ID }
			/>
		);
	}
}

PluginActivateToggle.propTypes = {
	site: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
	isMock: PropTypes.bool,
	disabled: PropTypes.bool,
};

PluginActivateToggle.defaultProps = {
	isMock: false,
	disabled: false,
};

export default connect( null, {
	recordGoogleEvent,
	recordTracksEvent,
} )( localize( PluginActivateToggle ) );
