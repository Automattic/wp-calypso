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
	constructor( props ) {
		super( props );

		this.state = this.getDataFromStores();
	}

	render() {
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
		this.props.updateAccountRecoveryEmail( newEmail );
	}

	onDelete = () => {
		accept( this.props.translate( 'Are you sure you want to remove the email address?' ), function( accepted ) {
			if ( accepted ) {
				this.props.deleteAccountRecoveryEmail();
			}
		} );
	}
}

export default localize( RecoveryEmail );
