import config from '@automattic/calypso-config';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import SupportInfo from 'calypso/components/support-info';
import withSiteMonitorSettings from 'calypso/data/site-monitor/with-site-monitor-settings';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'calypso/state/selectors/is-deactivating-jetpack-module';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class SiteSettingsFormJetpackMonitor extends Component {
	recordEvent = ( event ) => {
		return () => {
			this.props.trackEvent( event );
		};
	};

	handleToggle = ( name ) => () => {
		const { siteMonitorSettings } = this.props;
		this.props.trackEvent( `Toggled ${ name }` );
		this.props.updateSiteMonitorSettings( {
			...siteMonitorSettings,
			[ name ]: ! siteMonitorSettings[ name ],
		} );
	};

	settingsMonitorEmailCheckbox() {
		const { monitorActive, siteMonitorSettings, translate } = this.props;

		return (
			<ToggleControl
				disabled={ this.disableForm() || ! monitorActive }
				onChange={ this.handleToggle( 'email_notifications' ) }
				checked={ !! siteMonitorSettings?.email_notifications }
				label={ translate( 'Send notifications to your {{a}}WordPress.com email address{{/a}}', {
					components: {
						a: (
							<a
								href="/me/account"
								onClick={ this.recordEvent(
									'Clicked on Monitor Link to WordPress.com Email Address'
								) }
							/>
						),
					},
				} ) }
			/>
		);
	}

	settingsMonitorWpNoteCheckbox() {
		const { monitorActive, siteMonitorSettings, translate } = this.props;
		return (
			<ToggleControl
				disabled={ this.disableForm() || ! monitorActive }
				onChange={ this.handleToggle( 'wp_note_notifications' ) }
				checked={ !! siteMonitorSettings?.wp_note_notifications }
				label={ translate( 'Send notifications via WordPress.com notification' ) }
			/>
		);
	}

	disableForm() {
		return (
			this.props.activatingMonitor ||
			this.props.deactivatingMonitor ||
			this.props.isUpdatingSiteMonitorSettings ||
			this.props.fetchingJetpackModules ||
			this.props.isLoadingSiteMonitorSettings
		);
	}

	render() {
		const { siteId, translate } = this.props;

		if ( ! config.isEnabled( 'settings/security/monitor' ) ) {
			return null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<PanelCard className="jetpack-monitor-settings">
				<QueryJetpackModules siteId={ siteId } />

				<PanelCardHeading>{ translate( 'Downtime monitoring' ) }</PanelCardHeading>

				<SupportInfo
					text={ translate(
						'Jetpack will continuously monitor your site, and alert you the moment downtime is detected.'
					) }
					link="https://jetpack.com/support/monitor/"
				/>

				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="monitor"
					label={ translate(
						'Get alerts if your site goes offline. We’ll let you know when it’s back up, too.'
					) }
					disabled={ this.disableForm() }
				/>

				<div className="jetpack-monitor-settings__child-settings">
					{ this.settingsMonitorEmailCheckbox() }
					{ this.settingsMonitorWpNoteCheckbox() }
				</div>
			</PanelCard>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			monitorActive: isJetpackModuleActive( state, siteId, 'monitor' ),
			activatingMonitor: isActivatingJetpackModule( state, siteId, 'monitor' ),
			deactivatingMonitor: isDeactivatingJetpackModule( state, siteId, 'monitor' ),
			fetchingJetpackModules: isFetchingJetpackModules( state, siteId ),
		};
	},
	{
		trackEvent: ( event ) => recordGoogleEvent( 'Site Settings', event ),
	}
)( withSiteMonitorSettings( localize( SiteSettingsFormJetpackMonitor ) ) );
