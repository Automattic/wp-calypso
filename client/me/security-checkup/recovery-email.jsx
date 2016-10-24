/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import SecurityCheckupActions from 'lib/security-checkup/actions';
import ManageContact from './manage-contact';
import EditEmail from './edit-email';
import accept from 'lib/accept';

class RecoveryEmail extends Component {
	constructor( props ) {
		super( props );

		this.state = this.getDataFromStores();
	}

	componentDidMount() {
		AccountRecoveryStore.on( 'change', this.refreshData );
	}

	componentWillUnmount() {
		AccountRecoveryStore.off( 'change', this.refreshData );
	}

	refreshData = () => {
		this.setState( this.getDataFromStores() );
	}

	getDataFromStores() {
		return AccountRecoveryStore.getEmail();
	}

	render() {
		const email = this.state.data ? this.state.data.email : false,
			primaryEmail = this.props.userSettings.getSetting( 'user_email' );

		return (
			<ManageContact
				type="email"
				isLoading={ this.state.loading }
				title={ translate( 'Recovery Email Address' ) }
				subtitle={ email ? email : translate( 'Not set' ) }
				hasValue={ !! email }
				lastNotice={ this.state.lastNotice }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ this.onDismissNotice }
				>
					<EditEmail
						primaryEmail={ primaryEmail }
						storedEmail={ this.state.data.email }
						/>
				</ManageContact>
		);
	}

	haveEmail() {
		return !! this.state.data.email;
	}

	onSave = ( email ) => {
		SecurityCheckupActions.updateEmail( email, this.state.data.email );
	}

	onDelete = () => {
		accept( translate( 'Are you sure you want to remove the email address?' ), function( accepted ) {
			if ( accepted ) {
				SecurityCheckupActions.deleteEmail();
			}
		} );
	}

	onDismissNotice = () => {
		SecurityCheckupActions.dismissEmailNotice();
	}
}

RecoveryEmail.displayName = 'SecurityCheckupRecoveryEmail';

export default RecoveryEmail;
