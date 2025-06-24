import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import SettingsForm from 'calypso/me/notification-settings/settings-form';
import ReauthRequired from 'calypso/me/reauth-required';
import { fetchSettings, toggle, saveSettings } from 'calypso/state/notification-settings/actions';
import {
	getNotificationSettings,
	hasUnsavedNotificationSettingsChanges,
} from 'calypso/state/notification-settings/selectors';
import Navigation from '../navigation';
import SubscriptionManagementBackButton from '../subscription-management-back-button';

import './style.scss';

class NotificationCommentsSettings extends Component {
	componentDidMount() {
		this.props.fetchSettings();
	}

	renderForm = () => {
		if ( this.props.settings ) {
			return (
				<SettingsForm
					sourceId="other"
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
			<Main wideLayout className="comment-settings__main">
				<PageViewTracker
					path="/me/notifications/comments"
					title="Me > Notifications > Comments on other sites"
				/>
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<SubscriptionManagementBackButton />

				<NavigationHeader navigationItems={ [] } title={ translate( 'Notification Settings' ) } />

				<Navigation path={ path } />

				<Card>
					<FormSectionHeading>{ translate( 'Comments on other sites' ) }</FormSectionHeading>
					<p>{ translate( 'Manage notifications for comments you leave on other sites.' ) }</p>
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
