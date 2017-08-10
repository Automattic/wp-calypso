/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ErrorMessage from 'account-recovery/components/account-recovery-error-message';
import FormPasswordInput from 'components/forms/form-password-input';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';
import { STRONG_PASSWORD } from 'lib/url/support';
import {
	getAccountRecoveryResetUserData,
	getAccountRecoveryResetSelectedMethod,
	getAccountRecoveryValidationKey,
	getAccountRecoveryResetPasswordError,
	isRequestingResetPassword,
} from 'state/selectors';
import { requestResetPassword } from 'state/account-recovery/reset/actions';

class ResetPasswordConfirmForm extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			newPassword: '',
		};
	}

	submitNewPassword = event => {
		const { userData, selectedMethod, validationKey } = this.props;

		const { newPassword } = this.state;

		this.props.requestResetPassword( userData, selectedMethod, validationKey, newPassword );

		event.preventDefault();
	};

	updateNewPassword = event => {
		this.setState( { newPassword: event.target.value } );
	};

	render() {
		const { translate, isRequesting, error } = this.props;

		const { newPassword } = this.state;

		return (
			<Card>
				<h2 className="reset-password-confirm-form__title">
					{ translate( 'Reset your password' ) }
				</h2>
				<form onSubmit={ this.submitNewPassword }>
					<FormLabel className="reset-password-confirm-form__text-input-label" htmlFor="password">
						{ translate( 'New password' ) }
					</FormLabel>
					<FormPasswordInput
						className="reset-password-confirm-form__password-input-field"
						id="password"
						onChange={ this.updateNewPassword }
						value={ newPassword }
						autoFocus
					/>
					<FormButton
						className="reset-password-confirm-form__button generate-password-button"
						type="button"
						isPrimary={ false }
					>
						{ translate( 'Generate strong password' ) }
					</FormButton>
					<p className="reset-password-confirm-form__description">
						{ translate(
							'{{a}}Great passwords{{/a}} use upper and lower case characters, numbers, ' +
								'and symbols like {{em}}%(symbols)s{{/em}}.',
							{
								args: {
									symbols: '!/"$%&',
								},
								components: {
									a: <a href={ STRONG_PASSWORD } target="_blank" rel="noopener noreferrer" />,
									em: <em />,
								},
							}
						) }
					</p>
					{ error && <ErrorMessage error={ error } /> }
					<FormButton
						className="reset-password-confirm-form__button submit"
						type="submit"
						disabled={ isRequesting || ! newPassword }
					>
						{ translate( 'Reset Password' ) }
					</FormButton>
				</form>
			</Card>
		);
	}
}

ResetPasswordConfirmForm.defaultProps = {
	translate: identity,
};

export default connect(
	state => ( {
		userData: getAccountRecoveryResetUserData( state ),
		selectedMethod: getAccountRecoveryResetSelectedMethod( state ),
		validationKey: getAccountRecoveryValidationKey( state ),
		isRequesting: isRequestingResetPassword( state ),
		error: getAccountRecoveryResetPasswordError( state ),
	} ),
	{
		requestResetPassword,
	}
)( localize( ResetPasswordConfirmForm ) );
