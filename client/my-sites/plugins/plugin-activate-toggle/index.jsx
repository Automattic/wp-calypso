/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PluginsActions from 'lib/plugins/actions';
import PluginsLog from 'lib/plugins/log-store';
import PluginAction from 'my-sites/plugins/plugin-action/plugin-action';
import DisconnectJetpackButton from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button';
import analytics from 'lib/analytics';

class PluginActivateToggle extends Component {
	toggleActivation = () => {
		const { isMock, disabled, site, plugin, notices } = this.props;
		if ( isMock || disabled ) {
			return;
		}

		PluginsActions.togglePluginActivation( site, plugin );
		PluginsActions.removePluginsNotices( notices.completed.concat( notices.errors ) );

		if ( plugin.active ) {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Deactivate Plugin', 'Plugin Name', plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_deactivate_click', {
				site: site.ID,
				plugin: plugin.slug
			} );
		} else {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Activate Plugin', 'Plugin Name', plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_activate_click', {
				site: site.ID,
				plugin: plugin.slug
			} );
		}
	}

	render() {
		const { site, plugin, isMock, disabled, translate } = this.props;

		if ( ! site ) {
			return null;
		}

		const inProgress = PluginsLog.isInProgressAction( site.ID, plugin.slug, [
			'ACTIVATE_PLUGIN',
			'DEACTIVATE_PLUGIN'
		] );

		if ( plugin && 'jetpack' === plugin.slug ) {
			return (
				<PluginAction
					className="plugin-activate-toggle"
					htmlFor={ 'disconnect-jetpack-' + site.ID }
					>
					<DisconnectJetpackButton
						disabled={ disabled || ! plugin }
						site={ site }
						redirect="/plugins/jetpack"
						isMock={ isMock }
						/>
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
};

export default localize( PluginActivateToggle );
