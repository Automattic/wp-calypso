/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { loginUserWithTwoFactorVerificationCode } from 'state/login/actions';
import {
	getTwoFactorAuthId,
	getTwoFactorAuthNonce,
} from 'state/login/selectors';

class VerificationCodeInput extends Component {
	static propTypes = {
		rememberMe: PropTypes.bool.isRequired,
		twoStepId: PropTypes.string.isRequired,
		twoStepNonce: PropTypes.string.isRequired,
	};

	state = {
		twoStepCode: '',
		error: null
	};

	onChangeField = ( event ) => {
		if ( event.target.type === 'checkbox' ) {
			this.setState( {
				[ event.target.name ]: event.target.checked
			} );
			return;
		}
		// Reset the error state if the user updates the field after an error coming
		// from the state
		this.setState( {
			[ event.target.name ]: event.target.value,
			error: null
		} );
	};

	onCodeSubmit = ( event ) => {
		const { twoStepId, twoStepNonce, rememberMe } = this.props;
		const { twoStepCode } = this.state;
		event.preventDefault();
		this.props.loginUserWithTwoFactorVerificationCode( twoStepId, twoStepCode, twoStepNonce, rememberMe ).then( () => {
			this.props.onSuccess( this.state );
		} );
	};

	render() {
		const { translate } = this.props;
		const isError = !! this.state.error;
		const errorText = isError && translate( 'Invalid verification code' );

		return (
			<div>
				<form onSubmit={ this.onCodeSubmit }>
					<Card>
						<p>
							{ translate( 'Please enter the verification code generated' +
								' by your Authenticator mobile application.' ) }
						</p>
						<FormFieldset>
							<FormLabel htmlFor="twoStepCode">
								{ translate( 'Verification Code' ) }
							</FormLabel>
							<FormTextInput
								onChange={ this.onChangeField }
								className={ classNames( { 'is-error': isError } ) }
								name="twoStepCode" />
							{ isError && (
								<FormInputValidation isError text={ errorText } />
							) }
						</FormFieldset>
						<FormButtonsBar>
							<FormButton onClick={ this.onSubmit } primary>{ translate( 'Log in' ) }</FormButton>
						</FormButtonsBar>
					</Card>
				</form>
				<p>
					<ExternalLink
						icon={ true }
						target="_blank"
						href="http://en.support.wordpress.com/security/two-step-authentication/">
						{ translate( 'Help' ) }
					</ExternalLink>
				</p>
				<hr />
				<p>
					<a href="#">{ translate( 'Send recovery code via text' ) }</a>
				</p>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		twoStepId: getTwoFactorAuthId( state ),
		twoStepNonce: getTwoFactorAuthNonce( state ),
	} ),
	{
		loginUserWithTwoFactorVerificationCode,
	}
)( localize( VerificationCodeInput ) );
