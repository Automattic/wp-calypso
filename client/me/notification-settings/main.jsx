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
import Main from 'components/main';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Navigation from './navigation';
import BlogsSettings from './blogs-settings';
import PushNotificationSettings from './push-notification-settings';
import QueryUserDevices from 'components/data/query-user-devices';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { fetchSettings, toggle, saveSettings } from 'state/notification-settings/actions';
import {
	getNotificationSettings,
	hasUnsavedNotificationSettingsChanges,
} from 'state/notification-settings/selectors';

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
			<Main className="notification-settings">
				<PageViewTracker path="/me/notifications" title="Me > Notifications" />
				<QueryUserDevices />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
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
