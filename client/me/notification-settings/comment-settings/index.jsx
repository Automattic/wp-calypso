/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Navigation from '../navigation';
import { Card } from '@automattic/components';
import FormSectionHeading from 'components/forms/form-section-heading';
import SettingsForm from 'me/notification-settings/settings-form';
import QueryUserDevices from 'components/data/query-user-devices';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { fetchSettings, toggle, saveSettings } from 'state/notification-settings/actions';
import {
	getNotificationSettings,
	hasUnsavedNotificationSettingsChanges,
} from 'state/notification-settings/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class NotificationCommentsSettings extends Component {
	componentDidMount() {
		this.props.fetchSettings();
	}

	renderForm = () => {
		if ( this.props.settings ) {
			return (
				<SettingsForm
					sourceId={ 'other' }
					settings={ this.props.settings }
					settingKeys={ [ 'comment_like', 'comment_reply' ] }
					hasUnsavedChanges={ this.props.hasUnsavedChanges }
					onToggle={ ( source, stream, setting ) => this.props.toggle( source, stream, setting ) }
					onSave={ () => this.props.saveSettings( 'other', this.props.settings ) }
				/>
			);
		}

		return <p className="comment-settings__notification-settings-placeholder">&nbsp;</p>;
	};

	render() {
		const { path, translate } = this.props;

		return (
			<Main>
				<PageViewTracker
					path="/me/notifications/comments"
					title="Me > Notifications > Comments on other sites"
				/>
				<QueryUserDevices />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<Navigation path={ path } />

				<Card>
					<FormSectionHeading>{ translate( 'Comments on other sites' ) }</FormSectionHeading>
					<p>
						{ translate( 'Control your notification settings when you comment on other blogs.' ) }
					</p>
					{ this.renderForm() }
				</Card>
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		settings: getNotificationSettings( state, 'other' ),
		hasUnsavedChanges: hasUnsavedNotificationSettingsChanges( state, 'other' ),
	} ),
	{ fetchSettings, toggle, saveSettings }
)( localize( NotificationCommentsSettings ) );
