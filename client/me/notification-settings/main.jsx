/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'client/state/notices/actions';
import Main from 'client/components/main';
import ReauthRequired from 'client/me/reauth-required';
import twoStepAuthorization from 'client/lib/two-step-authorization';
import MeSidebarNavigation from 'client/me/sidebar-navigation';
import Navigation from './navigation';
import BlogsSettings from './blogs-settings';
import PushNotificationSettings from './push-notification-settings';
import store from 'client/lib/notification-settings-store';
import QueryUserDevices from 'client/components/data/query-user-devices';
import {
	fetchSettings,
	toggle,
	saveSettings,
} from 'client/lib/notification-settings-store/actions';

class NotificationSettings extends Component {
	state = {
		settings: null,
		hasUnsavedChanges: false,
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
			this.props.errorNotice(
				this.props.translate( 'There was a problem saving your changes. Please, try again.' )
			);
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( this.props.translate( 'Settings saved successfully!' ) );
		}

		this.setState( state );
	};

	render() {
		const findSettingsForBlog = blogId =>
			this.state.settings.find( blog => blog.get( 'blog_id' ) === parseInt( blogId, 10 ) );
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
					onSaveToAll={ onSaveToAll }
				/>
			</Main>
		);
	}
}

export default connect( null, { successNotice, errorNotice } )( localize( NotificationSettings ) );
