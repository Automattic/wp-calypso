/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import EditEmail from './edit-email';
import ManageContact from './manage-contact';
import accept from 'lib/accept';

class RecoveryEmail extends Component {
	render() {
		const {
			primaryEmail,
			email,
			translate,
			isLoading,
		} = this.props;

		return (
			<ManageContact
				type="email"
				isLoading={ isLoading }
				title={ translate( 'Recovery Email Address' ) }
				subtitle={ email ? email : translate( 'Not set' ) }
				hasValue={ !! email }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				>
					<EditEmail
						primaryEmail={ primaryEmail }
						storedEmail={ email || '' }
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
