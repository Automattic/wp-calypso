/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import notices from 'notices';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QuerySiteMonitorSettings from 'components/data/query-site-monitor-settings';
import { protectForm } from 'lib/protect-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import { activateModule, deactivateModule } from 'state/jetpack/modules/actions';
import { updateSiteMonitorSettings } from 'state/sites/monitor/actions';
import { recordGoogleEvent } from 'state/analytics/actions';
import {
	getSiteMonitorSettings,
	isActivatingJetpackModule,
	isDeactivatingJetpackModule,
	isFetchingJetpackModules,
	isJetpackModuleActive,
	isMonitorSettingsUpdateSuccessful,
	isRequestingSiteMonitorSettings,
	isUpdatingSiteMonitorSettings
} from 'state/selectors';

class SiteSettingsFormJetpackMonitor extends Component {
	state = {};

	componentWillReceiveProps( nextProps ) {
		if ( isEmpty( this.state ) && nextProps.monitorSettings ) {
			this.setState( nextProps.monitorSettings );
		}
	}

	recordEvent = ( event ) => {
		return () => {
			this.props.trackEvent( event );
		};
	}

	handleToggle = name => () => {
		this.props.trackEvent( `Toggled ${ name }` );
		this.setState( {
			...this.state,
			[ name ]: ! this.state[ name ],
		} );
		this.saveSettings();
	}

	prompt() {
		const { translate } = this.props;

		return (
			<div className="site-settings__jetpack-prompt">
				<img src="/calypso/images/jetpack/illustration-jetpack-monitor.svg" width="128" height="128" />

				<div className="site-settings__jetpack-prompt-text">
					<p>{ translate( "Automatically monitor your website and make sure it's online." ) }</p>
					<p>
						{ translate(
							"We'll periodically check your site from our global network of servers to make sure it's online, and email you if it looks like your site is not responding for any reason."
						) }
					</p>
				</div>

			</div>
		);
	}

	saveSettings = () => {
		const { monitorSettingsUpdateSuccessful, siteId, translate } = this.props;
		notices.clearNotices( 'notices' );
		this.props.updateSiteMonitorSettings( siteId, this.state ).then( () => {
			if ( ! monitorSettingsUpdateSuccessful ) {
				this.handleError();
				notices.error( translate( 'There was a problem saving your changes. Please, try again.' ) );
				return;
			}
			notices.success( translate( 'Settings saved successfully!' ) );
			this.props.markSaved();
		} );
	}

	settings() {
		const { translate } = this.props;

		return (
			<div>
				<p>{ translate( "Jetpack is currently monitoring your site's uptime." ) }</p>
				{ this.settingsMonitorEmailCheckbox() }
				{ config.isEnabled( 'settings/security/monitor/wp-note' ) ? this.settingsMonitorWpNoteCheckbox() : '' }
			</div>
		);
	}

	settingsMonitorEmailCheckbox() {
		const { translate } = this.props;

		return (
			<CompactFormToggle
				disabled={ this.disableForm() }
				onChange={ this.handleToggle( 'email_notifications' ) }
				checked={ !! this.state.email_notifications }
			>
				{ translate( 'Send notifications to your {{a}}WordPress.com email address{{/a}}.', {
					components: {
						a: (
							<a
								href="/me/account"
								onClick={ this.recordEvent( 'Clicked on Monitor Link to WordPress.com Email Address' ) }
							/>
						)
					}
				} ) }
			</CompactFormToggle>
		);
	}

	settingsMonitorWpNoteCheckbox() {
		const { translate } = this.props;
		return (
			<CompactFormToggle
				disabled={ this.disableForm() }
				onChange={ this.handleToggle( 'wp_note_notifications' ) }
				checked={ !! this.state.wp_note_notifications }
			>
				{ translate( 'Send notifications via WordPress.com notification.' ) }
			</CompactFormToggle>
		);
	}

	// updates the state when an error occurs
	handleError() {
		this.setState( { submittingForm: false } );
		this.props.markSaved();
	}

	disableForm() {
		return (
			this.props.activatingMonitor ||
			this.props.deactivatingMonitor ||
			this.props.updatingMonitorSettings ||
			this.props.fetchingJetpackModules ||
			this.props.requestingMonitorSettings
		);
	}

	handleActivationButtonClick = () => {
		const { siteId } = this.props;
		this.props.activateModule( siteId, 'monitor', true );
	}

	handleDeactivationButtonClick = () => {
		const { siteId } = this.props;
		this.props.deactivateModule( siteId, 'monitor', true );
	}

	activateFormButtons() {
		const { activatingMonitor, translate } = this.props;

		return (
			<Button
				compact
				primary
				onClick={ this.handleActivationButtonClick }
				disabled={ this.disableForm() }
			>
				{ activatingMonitor ? translate( 'Activating…' ) : translate( 'Activate' ) }
			</Button>
		);
	}

	deactivateFormButtons() {
		const { deactivatingMonitor, translate } = this.props;
		return (
			<Button
				compact
				onClick={ this.handleDeactivationButtonClick }
				disabled={ this.disableForm() }
			>
				{ deactivatingMonitor ? translate( 'Deactivating…' ) : translate( 'Deactivate' ) }
			</Button>
		);
	}

	render() {
		const { monitorActive, siteId, translate } = this.props;

		if ( ! config.isEnabled( 'settings/security/monitor' ) ) {
			return null;
		}

		return (
			<div className="site-settings__security-settings">
				<QueryJetpackModules siteId={ siteId } />
				<QuerySiteMonitorSettings siteId={ siteId } />

				<SectionHeader label={ translate( 'Jetpack Monitor' ) }>
					{
						monitorActive
							? this.deactivateFormButtons()
							: this.activateFormButtons()
					}
				</SectionHeader>
				<Card className="jetpack-monitor-settings">
					{
						monitorActive
							? this.settings()
							: this.prompt()
					}
				</Card>
			</div>

		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			monitorActive: isJetpackModuleActive( state, siteId, 'monitor' ),
			activatingMonitor: isActivatingJetpackModule( state, siteId, 'monitor' ),
			fetchingJetpackModules: isFetchingJetpackModules( state, siteId ),
			deactivatingMonitor: isDeactivatingJetpackModule( state, siteId, 'monitor' ),
			monitorSettings: getSiteMonitorSettings( state, siteId ),
			monitorSettingsUpdateSuccessful: isMonitorSettingsUpdateSuccessful( state, siteId ),
			requestingMonitorSettings: isRequestingSiteMonitorSettings( state, siteId ),
			updatingMonitorSettings: isUpdatingSiteMonitorSettings( state, siteId ),
		};
	},
	( dispatch ) => {
		const trackEvent = name => dispatch( recordGoogleEvent( 'Site Settings', name ) );
		const boundActionCreators = bindActionCreators( {
			activateModule,
			deactivateModule,
			updateSiteMonitorSettings,
		}, dispatch );

		return {
			...boundActionCreators,
			trackEvent,
		};
	}
)( protectForm( localize( SiteSettingsFormJetpackMonitor ) ) );
