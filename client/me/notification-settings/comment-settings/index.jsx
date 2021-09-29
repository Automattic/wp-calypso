import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryUserDevices from 'calypso/components/data/query-user-devices';
import FormattedHeader from 'calypso/components/formatted-header';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import SettingsForm from 'calypso/me/notification-settings/settings-form';
import ReauthRequired from 'calypso/me/reauth-required';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import { fetchSettings, toggle, saveSettings } from 'calypso/state/notification-settings/actions';
import {
	getNotificationSettings,
	hasUnsavedNotificationSettingsChanges,
} from 'calypso/state/notification-settings/selectors';
import Navigation from '../navigation';

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
			<Main wideLayout className="comment-settings__main">
				<PageViewTracker
					path="/me/notifications/comments"
					title="Me > Notifications > Comments on other sites"
				/>
				<QueryUserDevices />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<FormattedHeader
					brandFont
					headerText={ translate( 'Notification Settings' ) }
					align="left"
				/>

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
