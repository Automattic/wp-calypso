/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';

class ResetPasswordSmsForm extends Component {
	render() {
		const {
			translate,
		} = this.props;

		return (
			<Card>
				<h2 className="reset-password-sms-form__title">
					{ translate( 'Reset your password' ) }
				</h2>
				<p>
					{ translate( 'Please enter the code you were sent by SMS. ' +
						'It will look something like {{code}}63423423{{/code}}. You may need to wait a few moments before it arrives.',
						{ components: { code: <code /> } } )
					}
				</p>
				<FormTextInput className="reset-password-sms-form__validation-code-input" />
				<FormButton className="reset-password-sms-form__submit-button">
					{ translate( 'Continue' ) }
				</FormButton>
				<a href="#" className="reset-password-sms-form__no-sms-link">
					{ translate( 'No SMS?' ) }
				</a>
			</Card>
		);
	}
}

export default localize( ResetPasswordSmsForm );
