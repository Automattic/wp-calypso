/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PluginsActions from 'lib/plugins/actions';
import PluginsLog from 'lib/plugins/log-store';
import PluginAction from 'my-sites/plugins/plugin-action/plugin-action';
import ExternalLink from 'components/external-link';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import utils from 'lib/site/utils';

export class PluginAutoUpdateToggle extends Component {
	toggleAutoUpdates = () => {
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

		PluginsActions.togglePluginAutoUpdate( site, plugin );
		PluginsActions.removePluginsNotices( notices.completed.concat( notices.errors ) );

		if ( plugin.autoupdate ) {
			recordGAEvent( 'Plugins', 'Clicked Toggle Disable Autoupdates Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_autoupdate_disable_click', {
				site: site.ID,
				plugin: plugin.slug
			} );
		} else {
			recordGAEvent( 'Plugins', 'Clicked Toggle Enable Autoupdates Plugin', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_autoupdate_enable_click', {
				site: site.ID,
				plugin: plugin.slug
			} );
		}
	};

	getDisabledInfo() {
		const { site, wporg, translate } = this.props;
		if ( ! site ) { // we don't have enough info
			return null;
		}

		if ( ! wporg ) {
			return translate( 'This plugin is not in the WordPress.org plugin repository, so we can\'t autoupdate it.' );
		}

		if ( ! site.hasMinimumJetpackVersion ) {
			return translate( '%(site)s is not running an up to date version of Jetpack', {
				args: { site: site.title }
			} );
		}

		if ( site.options.is_multi_network ) {
			return translate( '%(site)s is part of a multi-network installation, which is not currently supported.', {
				args: { site: site.title }
			} );
		}

		if ( ! utils.isMainNetworkSite( site ) ) {
			return translate( 'Only the main site on a multi-site installation can enable autoupdates for plugins.', {
				args: { site: site.title }
			} );
		}

		if ( ! site.canAutoupdateFiles && site.options.file_mod_disabled ) {
			const reasons = utils.getSiteFileModDisableReason( site, 'autoupdateFiles' );
			const html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ translate( 'Autoupdates are not available for %(site)s:', { args: { site: site.title } } ) }
					</p>
				);
				const list = reasons.map( ( reason, i ) => ( <li key={ 'reason-i' + i + '-' + site.ID } >{ reason }</li> ) );
				html.push( <ul className="plugin-action__disabled-info-list" key="reason-shell-list">{ list }</ul> );
			} else {
				html.push(
					<p key="reason-shell">{
						translate( 'Autoupdates are not available for %(site)s. %(reason)s', {
							args: { site: site.title, reason: reasons[ 0 ] }
						} )
					}</p> );
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={ this.recordEvent }
					href="https://jetpack.me/support/site-management/#file-update-disabled"
					>
					{ translate( 'How do I fix this?' ) }
				</ExternalLink>
			);

			return html;
		}
		return null;
	}

	render() {
		const { site, plugin, translate, disabled } = this.props;
		if ( ! site.jetpack ) {
			return null;
		}

		const inProgress = PluginsLog.isInProgressAction( site.ID, plugin.slug, [
				'ENABLE_AUTOUPDATE_PLUGIN',
				'DISABLE_AUTOUPDATE_PLUGIN'
			] ),
			getDisabledInfo = this.getDisabledInfo(),
			label = getDisabledInfo
				? translate( 'Autoupdates disabled', {
					context: 'this goes next to an icon that displays if the plugin has "autoupdates disabled" active'
				} )
				: translate( 'Autoupdates', {
					context: 'this goes next to an icon that displays if the plugin has "autoupdates" active'
				} );

		return (
			<PluginAction
				disabled={ disabled }
				label={ label }
				status={ plugin.autoupdate }
				action={ this.toggleAutoUpdates }
				inProgress={ inProgress }
				disabledInfo={ getDisabledInfo }
				htmlFor={ 'autoupdates-' + plugin.slug + '-' + site.ID } />
		);
	}
}

PluginAutoUpdateToggle.propTypes = {
	isMock: PropTypes.bool,
	site: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
	wporg: PropTypes.bool,
	disabled: PropTypes.bool,
};

PluginAutoUpdateToggle.defaultProps = {
	isMock: false,
	disabled: false,
};

export default connect(
	null,
	{
		recordGoogleEvent,
		recordTracksEvent
	}
)( localize( PluginAutoUpdateToggle ) );
