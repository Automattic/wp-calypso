/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import { successNotice, errorNotice } from 'state/notices/actions'
import Main from 'components/main';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Navigation from './navigation';
import BlogsSettings from './blogs-settings';
import PushNotificationSettings from './push-notification-settings';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggle, saveSettings } from 'lib/notification-settings-store/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const NotificationSettings = React.createClass( {
	displayName: 'NotificationSettings',

	mixins: [ observe( 'sites', 'devices', 'pushNotifications' ) ],

	getInitialState() {
		return {
			settings: null,
			hasUnsavedChanges: false
		};
	},

	componentDidMount() {
		store.on( 'change', this.onChange );
		this.props.devices.get();
		fetchSettings();
	},

	componentWillUnmount() {
		store.off( 'change', this.onChange );
	},

	onChange() {
		const state = store.getStateFor( 'blogs' );

		if ( state.error ) {
			this.props.errorNotice( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( this.translate( 'Settings saved successfully!' ) );
		}

		this.setState( state );
	},

	render() {
		const findSettingsForBlog = blogId => this.state.settings.find( blog => blog.get( 'blog_id' ) === parseInt( blogId, 10 ) );

		return (
			<Main className="notification-settings">
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Navigation path={ this.props.path } />
				<PushNotificationSettings pushNotifications={ this.props.pushNotifications } />
				<BlogsSettings
					blogs={ this.props.blogs }
					devices={ this.props.devices }
					settings={ this.state.settings }
					hasUnsavedChanges={ this.state.hasUnsavedChanges }
					onToggle={ ( source, stream, setting ) => toggle( source, stream, setting ) }
					onSave={ blogId => saveSettings( 'blogs', findSettingsForBlog( blogId ) ) }
					onSaveToAll={ blogId => saveSettings( 'blogs', findSettingsForBlog( blogId ), true ) } />
			</Main>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, errorNotice }, dispatch )
)( NotificationSettings );
