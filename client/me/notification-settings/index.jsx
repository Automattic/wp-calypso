/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import { success, error, removeNotice } from 'state/notices/actions';
import Main from 'components/main';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Navigation from './navigation';
import BlogsSettings from './blogs-settings';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggle, saveSettings } from 'lib/notification-settings-store/actions';
import { connect } from 'react-redux';

const NotificationSettings = React.createClass( {
	displayName: 'NotificationSettings',

	mixins: [ observe( 'sites', 'devices' ) ],

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
			this.props.successNotice( this.translate( 'Settings saved successfully!' ), { duration: 3000 } );
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
	() => {
		return {}
	},
	( dispatch ) => { return {
		successNotice: ( text, options ) => {
			var action = success( text, options );
			if ( action.duration > 0 ) {
				setTimeout( () => {
					dispatch( removeNotice( action.noticeId ) );
				}, action.duration );
			}
			dispatch( action );
		},
		errorNotice: ( text, options ) => {
			dispatch( error( text, options ) );
		}
	} }
)( NotificationSettings );
