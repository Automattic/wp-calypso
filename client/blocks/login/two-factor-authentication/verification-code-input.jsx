/**
 * External dependencies
 */
import React, { Component } from 'react';
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
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { loginUserWithTwoFactorVerificationCode } from 'state/login/actions';
import { getVerificationCodeSubmissionError } from 'state/login/selectors';
import { getTwoFactorAuthId, getTwoFactorAuthNonce } from 'state/login/selectors';

class VerificationCodeInput extends Component {
	state = {
		twostep_code: '',
		remember: false,
		error: null
	};

	componentWillMount() {
		this.setState( {
			error: this.props.error
		} );
	}

	componentWillReceiveProps( newProps ) {
		this.setState( {
			error: newProps.error
		} );
	}

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

	onCodeSubmit = ( e ) => {
		const { twostep_id, twostep_nonce } = this.props;
		const { twostep_code, remember } = this.state;
		e.preventDefault();
		this.props.loginUserWithTwoFactorVerificationCode( twostep_id, twostep_code, twostep_nonce, remember );
	}

	render() {
		const isError = !! this.state.error;
		let errorText = this.state.error;
		if ( isError ) {
			errorText = this.props.translate( 'Invalid verification code' );
		}
		return (
			<div>
				<form onSubmit={ this.onCodeSubmit }>
					<Card>
						<p>
							{ this.props.translate( 'Please enter the verification code generated' +
								' by your Authentication mobile application' ) }
						</p>
						<FormFieldset>
							<FormLabel htmlFor="twostep_code">
								{ this.props.translate( 'Verification Code' ) }
							</FormLabel>
							<FormTextInput
								onChange={ this.onChangeField }
								className={ classNames( { 'is-error': isError } ) }
								name="twostep_code"
								/>
							{
								isError && (
									<FormInputValidation isError={ isError } text={ errorText } />
								)
							}
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="rembemer_me">
								<FormCheckbox
									name="remember"
									onChange={ this.onChangeField }
									/>
								<span>
									{ this.props.translate( 'Remember for 30 days' ) }
								</span>
							</FormLabel>
						</FormFieldset>
						<FormButtonsBar>
							<FormButton onClick={ this.onSubmit } primary>{ this.props.translate( 'Log in' ) }</FormButton>
						</FormButtonsBar>
					</Card>
				</form>
				<p>
					<ExternalLink
						icon={ true }
						target="_blank"
						href="http://en.support.wordpress.com/security/two-step-authentication/">
						{ this.props.translate( 'Help' ) }
					</ExternalLink>
				</p>
				<hr />
				<p>
					<a href="#">{ this.props.translate( 'Send recovery code via text' ) }</a>
				</p>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		return {
			twostep_id: getTwoFactorAuthId( state ),
			twostep_nonce: getTwoFactorAuthNonce( state ),
			error: getVerificationCodeSubmissionError( state )
		};
	}, {
		loginUserWithTwoFactorVerificationCode
	} )( localize( VerificationCodeInput ) );
