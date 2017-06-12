/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PluginsActions from 'lib/plugins/actions';
import PluginsLog from 'lib/plugins/log-store';
import PluginAction from 'my-sites/plugins/plugin-action/plugin-action';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

export class PluginActivateToggle extends Component {
	toggleActivation = () => {
		const {
			isMock,
			disabled,
			site,
			plugin,
			notices,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent
		} = this.props;
		if ( isMock || disabled ) {
			return;
		}

		PluginsActions.togglePluginActivation( site, plugin );
		PluginsActions.removePluginsNotices( notices.completed.concat( notices.errors ) );

		if ( plugin.active ) {
			recordGAEvent( 'Plugins', 'Clicked Toggle Deactivate Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_deactivate_click', {
				site: site.ID,
				plugin: plugin.slug
			} );
		} else {
			recordGAEvent( 'Plugins', 'Clicked Toggle Activate Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_activate_click', {
				site: site.ID,
				plugin: plugin.slug
			} );
		}
	};

	trackManageConnectionLink = () => {
		const { recordGoogleEvent: recordGAEvent } = this.props;
		recordGAEvent( 'Plugins', 'Clicked Manage Jetpack Connection Link', 'Plugin Name', 'jetpack' );
	}

	manageConnectionLink() {
		const { disabled, translate, site } = this.props;
		if ( disabled ) {
			return (
				<span className="plugin-activate-toggle__disabled">
					{ translate( 'Manage Connection', { comment: 'manage Jetpack connnection settings link' } ) }
					<span className="plugin-activate-toggle__icon"><Gridicon icon="cog" size={ 18 } /></span>
				</span>
			);
		}

		return (
			<span className="plugin-activate-toggle__link">
				<a onClick={ this.trackManageConnectionLink }
					href={ '/settings/general/' + site.slug } >
					{ translate( 'Manage Connection', { comment: 'manage Jetpack connnection settings link' } ) }
				</a>
				<a className="plugin-activate-toggle__icon"
					onClick={ this.trackManageConnectionLink }
					href={ '/settings/general/' + site.slug } >
					<Gridicon icon="cog" size={ 18 } />
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
			'DEACTIVATE_PLUGIN'
		] );

		if ( plugin && 'jetpack' === plugin.slug ) {
			return (
				<PluginAction
					className="plugin-activate-toggle"
					htmlFor={ 'disconnect-jetpack-' + site.ID }
					>{ this.manageConnectionLink() }
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
	notices: React.PropTypes.object,
	isMock: PropTypes.bool,
	disabled: React.PropTypes.bool,
};

PluginActivateToggle.defaultProps = {
	isMock: false,
	disabled: false,
};

export default connect(
	null,
	{
		recordGoogleEvent,
		recordTracksEvent
	}
)( localize( PluginActivateToggle ) );
