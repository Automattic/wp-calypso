/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

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
		// const email = this.state.data ? this.state.data.email : false;
		// const primaryEmail = this.props.userSettings.getSetting( 'user_email' );
		const {
			primaryEmail,
			accountRecoveryEmail,
			translate,
		} = this.props;

		return (
			<ManageContact
				type="email"
				isLoading={ this.state.loading }
				title={ translate( 'Recovery Email Address' ) }
				subtitle={ accountRecoveryEmail ? accountRecoveryEmail : translate( 'Not set' ) }
				hasValue={ !! accountRecoveryEmail }
				lastNotice={ this.state.lastNotice }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ this.onDismissNotice }
				>
					<EditEmail
						primaryEmail={ primaryEmail }
						storedEmail={ accountRecoveryEmail }
						/>
				</ManageContact>
		);
	}

	onSave = ( newEmail ) => {
		// TODO:
		// check if email !== primaryEmail
		this.props.updateAccountRecoveryEmail( newEmail );
		// SecurityCheckupActions.updateEmail( email, this.state.data.email );
	}

	onDelete = () => {
		accept( this.props.translate( 'Are you sure you want to remove the email address?' ), function( accepted ) {
			if ( accepted ) {
				this.props.deleteAccountRecoveryEmail();
			}
		} );
	}

	onDismissNotice = () => {
		SecurityCheckupActions.dismissEmailNotice();
	}
}

export default localize( RecoveryEmail );
