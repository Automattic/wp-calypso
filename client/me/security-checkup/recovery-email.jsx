/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ManageContact from './manage-contact';
import EditEmail from './edit-email';
import accept from 'lib/accept';

class RecoveryEmail extends Component {
	render() {
		const {
			primaryEmail,
			accountRecoveryEmail,
			translate,
			isLoading,
		} = this.props;

		// TODO: lastNotice? onDismissNotice?
		return (
			<ManageContact
				type="email"
				isLoading={ isLoading }
				title={ translate( 'Recovery Email Address' ) }
				subtitle={ accountRecoveryEmail ? accountRecoveryEmail : translate( 'Not set' ) }
				hasValue={ !! accountRecoveryEmail }
				lastNotice={ null }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ () => {} }
				>
					<EditEmail
						primaryEmail={ primaryEmail }
						storedEmail={ accountRecoveryEmail }
						/>
				</ManageContact>
		);
	}

	onSave = ( newEmail ) => {
		this.props.updateAccountRecoveryEmail( newEmail );
	}

	onDelete = () => {
		const {
			translate,
			deleteAccountRecoveryEmail,
		} = this.props;

		accept( translate( 'Are you sure you want to remove the email address?' ), ( accepted ) => {
			if ( accepted ) {
				deleteAccountRecoveryEmail();
			}
		} );
	}
}

export default localize( RecoveryEmail );
