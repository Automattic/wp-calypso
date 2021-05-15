/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import ReauthRequired from 'calypso/me/reauth-required';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import Navigation from './navigation';
import BlogsSettings from './blogs-settings';
import PushNotificationSettings from './push-notification-settings';
import QueryUserDevices from 'calypso/components/data/query-user-devices';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { fetchSettings, toggle, saveSettings } from 'calypso/state/notification-settings/actions';
import {
	getNotificationSettings,
	hasUnsavedNotificationSettingsChanges,
} from 'calypso/state/notification-settings/selectors';
import FormattedHeader from 'calypso/components/formatted-header';

class NotificationSettings extends Component {
	componentDidMount() {
		this.props.fetchSettings();
	}

	onChange = () => {
		const { error, status } = this.props;

		if ( error ) {
			this.props.errorNotice(
				this.props.translate( 'There was a problem saving your changes. Please, try again.' ),
				{
					id: 'notif-settings-save',
				}
			);
		}

		if ( status === 'success' ) {
			this.props.successNotice( this.props.translate( 'Settings saved successfully!' ), {
				id: 'notif-settings-save',
				duration: 4000,
			} );
		}
	};

	render() {
		// TODO: We should avoid creating functions in the render method
		const findSettingsForBlog = ( blogId ) =>
			find( this.props.settings, { blog_id: parseInt( blogId, 10 ) } );
		const onSave = ( blogId ) => this.props.saveSettings( 'blogs', findSettingsForBlog( blogId ) );
		const onSaveToAll = ( blogId ) =>
			this.props.saveSettings( 'blogs', findSettingsForBlog( blogId ), true );

		return (
			<Main wideLayout className="notification-settings">
				<PageViewTracker path="/me/notifications" title="Me > Notifications" />
				<QueryUserDevices />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<FormattedHeader
					brandFont
					headerText={ this.props.translate( 'Notification Settings' ) }
					align="left"
				/>

				<Navigation path={ this.props.path } />
				<PushNotificationSettings pushNotifications={ this.props.pushNotifications } />
				<BlogsSettings
					settings={ this.props.settings }
					hasUnsavedChanges={ this.props.hasUnsavedChanges }
					onToggle={ this.props.toggle }
					onSave={ onSave }
					onSaveToAll={ onSaveToAll }
				/>
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		settings: getNotificationSettings( state, 'blogs' ),
		hasUnsavedChanges: hasUnsavedNotificationSettingsChanges( state, 'blogs' ),
	} ),
	{ fetchSettings, toggle, saveSettings }
)( localize( NotificationSettings ) );
