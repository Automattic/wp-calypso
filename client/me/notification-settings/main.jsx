/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import BlogsSettings from './blogs-settings';
import Navigation from './navigation';
import PushNotificationSettings from './push-notification-settings';
import QueryUserDevices from 'components/data/query-user-devices';
import Main from 'components/main';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggle, saveSettings } from 'lib/notification-settings-store/actions';
import twoStepAuthorization from 'lib/two-step-authorization';
import ReauthRequired from 'me/reauth-required';
import MeSidebarNavigation from 'me/sidebar-navigation';
import { successNotice, errorNotice } from 'state/notices/actions';

class NotificationSettings extends Component {
	state = {
		settings: null,
		hasUnsavedChanges: false
	};

	componentDidMount() {
		store.on( 'change', this.onChange );
		fetchSettings();
	}

	componentWillUnmount() {
		store.off( 'change', this.onChange );
	}

	onChange = () => {
		const state = store.getStateFor( 'blogs' );

		if ( state.error ) {
			this.props.errorNotice( this.props.translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( this.props.translate( 'Settings saved successfully!' ) );
		}

		this.setState( state );
	};

	render() {
		const findSettingsForBlog = blogId => this.state.settings.find( blog => blog.get( 'blog_id' ) === parseInt( blogId, 10 ) );
		const onSave = blogId => saveSettings( 'blogs', findSettingsForBlog( blogId ) );
		const onSaveToAll = blogId => saveSettings( 'blogs', findSettingsForBlog( blogId ), true );

		return (
			<Main className="notification-settings">
				<QueryUserDevices />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Navigation path={ this.props.path } />
				<PushNotificationSettings pushNotifications={ this.props.pushNotifications } />
				<BlogsSettings
					settings={ this.state.settings }
					hasUnsavedChanges={ this.state.hasUnsavedChanges }
					onToggle={ toggle }
					onSave={ onSave }
					onSaveToAll={ onSaveToAll } />
			</Main>
		);
	}
}

export default connect(
	null,
	{ successNotice, errorNotice }
)( localize( NotificationSettings ) );
