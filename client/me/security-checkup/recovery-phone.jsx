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
	getTwoStepNotice( twoStepEnabled ) {
		if ( twoStepEnabled ) {
			return {
				type: 'error',
				message: this.props.translate( 'To edit your SMS Number, go to {{a}}Two-Step Authentication{{/a}}.', {
					components: {
						a: <a href="/me/security/two-step" />
					}
				} ),
				showDismiss: false
			};
		}

		return null;
	}

	render() {
		const twoStepEnabled = this.props.userSettings.isTwoStepEnabled();
		const twoStepNotice = this.getTwoStepNotice( twoStepEnabled );

		const {
			phone,
			isLoading,
			translate,
		} = this.props;

		// TODO:
		// lastNotice?
		return (
			<ManageContact
				type="sms"
				isLoading={ isLoading }
				title={ translate( 'Recovery SMS Number', {
					comment: 'Account security'
				} ) }
				subtitle={ phone ? phone.numberFull : translate( 'Not set' ) }
				hasValue={ !! phone }
				lastNotice={ twoStepNotice || null }
				disabled={ twoStepEnabled }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ this.onDismissNotice }
				>
					<EditPhone
						storedPhone={ phone }
						/>
				</ManageContact>
		);
	}

	onSave = ( phone ) => {
		this.props.updatePhone( phone );
	}

	onDelete = () => {
		const {
			translate,
			deletePhone,
		} = this.props;

		accept( translate( 'Are you sure you want to remove the SMS number?' ), ( accepted ) => {
			if ( accepted ) {
				deletePhone();
			}
		} );
	}

	onDismissNotice = () => {
		//TODO
	}
}

export default localize( RecoveryPhone );
