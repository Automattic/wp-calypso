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
			email,
			translate,
			isLoading,
		} = this.props;

		// TODO: lastNotice? onDismissNotice?
		return (
			<ManageContact
				type="email"
				isLoading={ isLoading }
				title={ translate( 'Recovery Email Address' ) }
				subtitle={ email ? email : translate( 'Not set' ) }
				hasValue={ !! email }
				lastNotice={ null }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ () => {} }
				>
					<EditEmail
						primaryEmail={ primaryEmail }
						storedEmail={ email ? email : '' }
						/>
				</ManageContact>
		);
	}

	onSave = ( newEmail ) => {
		this.props.updateEmail( newEmail );
	}

	onDelete = () => {
		const {
			translate,
			deleteEmail,
		} = this.props;

		accept( translate( 'Are you sure you want to remove the email address?' ), ( accepted ) => {
			if ( accepted ) {
				deleteEmail();
			}
		} );
	}
}

export default localize( RecoveryEmail );
