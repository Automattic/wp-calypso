/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import notices from 'notices';
import Main from 'components/main';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Navigation from '../navigation';
import Card from 'components/card';
import FormSectionHeading from 'components/forms/form-section-heading';
import SettingsForm from 'me/notification-settings/settings-form';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggle, saveSettings } from 'lib/notification-settings-store/actions';
import { successNotice } from 'state/notices/actions';

const NotificationCommentsSettings = React.createClass( {
	displayName: 'NotificationCommentsSettings',

	mixins: [ observe( 'devices' ) ],

	getInitialState() {
		return {
			settings: null
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
		const state = store.getStateFor( 'other' );

		if ( state.error ) {
			notices.error( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( this.translate( 'Settings saved successfully!' ) );
		}

		this.setState( state );
	},

	renderForm() {
		if ( this.props.devices.initialized && this.state.settings ) {
			return ( <SettingsForm
				sourceId={ 'other' }
				devices={ this.props.devices }
				settings={ this.state.settings }
				settingKeys={ [ 'comment_like', 'comment_reply' ] }
				hasUnsavedChanges={ this.state.hasUnsavedChanges }
				onToggle={ ( source, stream, setting ) => toggle( source, stream, setting ) }
				onSave={ () => saveSettings( 'other', this.state.settings ) } /> );
		}

		return ( <p className="notification-settings-comment-settings__placeholder">&nbsp;</p> );
	},

	render() {
		return (
			<Main>
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<Navigation path={ this.props.path } />

				<Card>
					<FormSectionHeading className="is-primary">
						{ this.translate( 'Comments on other sites' ) }
					</FormSectionHeading>
					<p>{ this.translate( 'Control your notification settings when you comment on other blogs.' ) }</p>
					{ this.renderForm() }
				</Card>
			</Main>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( NotificationCommentsSettings );
