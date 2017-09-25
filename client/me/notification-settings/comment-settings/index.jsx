/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Navigation from '../navigation';
import Card from 'components/card';
import QueryUserDevices from 'components/data/query-user-devices';
import FormSectionHeading from 'components/forms/form-section-heading';
import Main from 'components/main';
import store from 'lib/notification-settings-store';
import { fetchSettings, toggle, saveSettings } from 'lib/notification-settings-store/actions';
import twoStepAuthorization from 'lib/two-step-authorization';
import SettingsForm from 'me/notification-settings/settings-form';
import ReauthRequired from 'me/reauth-required';
import MeSidebarNavigation from 'me/sidebar-navigation';
import { successNotice, errorNotice } from 'state/notices/actions';

class NotificationCommentsSettings extends Component {
	state = { settings: null };

	componentDidMount() {
		store.on( 'change', this.onChange );
		fetchSettings();
	}

	componentWillUnmount() {
		store.off( 'change', this.onChange );
	}

	onChange = () => {
		const { translate } = this.props;
		const state = store.getStateFor( 'other' );

		if ( state.error ) {
			this.props.errorNotice( translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		if ( state.status === 'success' ) {
			this.props.successNotice( translate( 'Settings saved successfully!' ) );
		}

		this.setState( state );
	};

	renderForm = () => {
		if ( this.state.settings ) {
			return ( <SettingsForm
				sourceId={ 'other' }
				settings={ this.state.settings }
				settingKeys={ [ 'comment_like', 'comment_reply' ] }
				hasUnsavedChanges={ this.state.hasUnsavedChanges }
				onToggle={ ( source, stream, setting ) => toggle( source, stream, setting ) }
				onSave={ () => saveSettings( 'other', this.state.settings ) } /> );
		}

		return ( <p className="notification-settings-comment-settings__placeholder">&nbsp;</p> );
	};

	render() {
		const {
			path,
			translate
		} = this.props;

		return (
			<Main>
				<QueryUserDevices />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<Navigation path={ path } />

				<Card>
					<FormSectionHeading className="is-primary">
						{ translate( 'Comments on other sites' ) }
					</FormSectionHeading>
					<p>{ translate( 'Control your notification settings when you comment on other blogs.' ) }</p>
					{ this.renderForm() }
				</Card>
			</Main>
		);
	}
}

export default connect(
	null,
	{ errorNotice, successNotice }
)( localize( NotificationCommentsSettings ) );
