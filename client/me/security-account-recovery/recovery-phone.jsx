/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ManageContact from './manage-contact';
import EditPhone from './edit-phone';
import accept from 'lib/accept';

class RecoveryPhone extends Component {
	render() {
		const { phone, isLoading, translate, disabled } = this.props;

		return (
			<ManageContact
				type="sms"
				isLoading={ isLoading }
				title={ translate( 'Recovery SMS Number', {
					comment: 'Account security',
				} ) }
				subtitle={ phone ? phone.numberFull : translate( 'Not set' ) }
				hasValue={ !! phone }
				disabled={ disabled }
				onSave={ this.onSave }
				onDelete={ this.onDelete }
			>
				<EditPhone storedPhone={ phone } />
			</ManageContact>
		);
	}

	onSave = ( phone ) => {
		this.props.updatePhone( phone );
	};

	onDelete = () => {
		const { translate, deletePhone } = this.props;

		accept( translate( 'Are you sure you want to remove the SMS number?' ), ( accepted ) => {
			if ( accepted ) {
				deletePhone();
			}
		} );
	};
}

export default localize( RecoveryPhone );
