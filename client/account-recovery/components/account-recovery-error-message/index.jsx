/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { ACCOUNT_RECOVERY_ERROR_CODE as ERROR_CODE } from 'account-recovery/constants';
import config from 'config';

class AccountRecoveryErrorMessage extends Component {
	getErrorMessage = () => {
		const {
			translate,
			error,
		} = this.props;

		switch ( error.name ) {
			case ERROR_CODE.INVALID_KEY:
				return translate( "We've failed to validate with the given code. " +
					'Please double check if the code is correct.' );

			case ERROR_CODE.BAD_PASSWORD:
				return translate( "Sorry, you can't use this password either because " +
						"it's not strong enough or you have used that as one of your previous passwords." );
		}

		return translate(
			"We're having trouble connecting to our servers at the moment. " +
			'Please try again later. If the problem persists, please {{a}}contact us{{/a}}.',
			{ components: {
				a: <a href={ config( 'login_url' ) + '?action=recovery' } target="_blank" rel="noopener noreferrer" />
			} }
		);
	}

	render = () => {
		const errorMsg = this.getErrorMessage();

		return <p className="account-recovery-error-message__text">{ errorMsg }</p>;
	}
}

export default localize( AccountRecoveryErrorMessage );
