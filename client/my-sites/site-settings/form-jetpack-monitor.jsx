/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty, partial } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SectionHeader from 'components/section-header';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QuerySiteMonitorSettings from 'components/data/query-site-monitor-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updateSiteMonitorSettings } from 'state/sites/monitor/actions';
import { recordGoogleEvent } from 'state/analytics/actions';
import {
	getSiteMonitorSettings,
	isActivatingJetpackModule,
	isDeactivatingJetpackModule,
	isFetchingJetpackModules,
	isJetpackModuleActive,
	isRequestingSiteMonitorSettings,
	isUpdatingSiteMonitorSettings,
} from 'state/selectors';

class SiteSettingsFormJetpackMonitor extends Component {
	state = {};

	componentWillReceiveProps( nextProps ) {
		if ( isEmpty( this.state ) && nextProps.monitorSettings ) {
			this.setState( nextProps.monitorSettings );
		}
	}

	recordEvent = event => {
		return () => {
			this.props.trackEvent( event );
		};
	};

	handleToggle = name => () => {
		this.props.trackEvent( `Toggled ${ name }` );
		this.setState(
			{
				...this.state,
				[ name ]: ! this.state[ name ],
			},
			this.saveSettings
		);
	};

	saveSettings = () => {
		const { siteId } = this.props;

		this.props.updateSiteMonitorSettings( siteId, this.state );
	};

	settingsMonitorEmailCheckbox() {
		const { monitorActive, translate } = this.props;

		return (
			<CompactFormToggle
				disabled={ this.disableForm() || ! monitorActive }
				onChange={ this.handleToggle( 'email_notifications' ) }
				checked={ !! this.state.email_notifications }
			>
				{ translate( 'Send notifications to your {{a}}WordPress.com email address{{/a}}', {
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
			</CompactFormToggle>
		);
	}

	settingsMonitorWpNoteCheckbox() {
		const { monitorActive, translate } = this.props;
		return (
			<CompactFormToggle
				disabled={ this.disableForm() || ! monitorActive }
				onChange={ this.handleToggle( 'wp_note_notifications' ) }
				checked={ !! this.state.wp_note_notifications }
			>
				{ translate( 'Send notifications via WordPress.com notification' ) }
			</CompactFormToggle>
		);
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
	};

	handleDeactivationButtonClick = () => {
		const { siteId } = this.props;
		this.props.deactivateModule( siteId, 'monitor', true );
	};

	render() {
		const { siteId, translate } = this.props;

		if ( ! config.isEnabled( 'settings/security/monitor' ) ) {
			return null;
		}

		return (
			<div className="site-settings__security-settings">
				<QueryJetpackModules siteId={ siteId } />
				<QuerySiteMonitorSettings siteId={ siteId } />

				<SectionHeader label={ translate( 'Jetpack Monitor' ) } />

				<Card className="jetpack-monitor-settings">
					<div className="site-settings__info-link-container">
						<InfoPopover position="left">
							<ExternalLink href="https://jetpack.com/support/monitor/" icon target="_blank">
								{ translate( 'Learn more about Monitor.' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					<JetpackModuleToggle
						siteId={ siteId }
						moduleSlug="monitor"
						label={ translate( "Monitor your site's uptime" ) }
						disabled={ this.disableForm() }
					/>

					<div className="site-settings__child-settings">
						{ this.settingsMonitorEmailCheckbox() }
						{ config.isEnabled( 'settings/security/monitor/wp-note' ) &&
							this.settingsMonitorWpNoteCheckbox() }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			monitorActive: isJetpackModuleActive( state, siteId, 'monitor' ),
			activatingMonitor: isActivatingJetpackModule( state, siteId, 'monitor' ),
			deactivatingMonitor: isDeactivatingJetpackModule( state, siteId, 'monitor' ),
			fetchingJetpackModules: isFetchingJetpackModules( state, siteId ),
			monitorSettings: getSiteMonitorSettings( state, siteId ),
			requestingMonitorSettings: isRequestingSiteMonitorSettings( state, siteId ),
			updatingMonitorSettings: isUpdatingSiteMonitorSettings( state, siteId ),
		};
	},
	{
		trackEvent: partial( recordGoogleEvent, 'Site Settings' ),
		updateSiteMonitorSettings,
	}
)( localize( SiteSettingsFormJetpackMonitor ) );
