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

class WaitingTwoFactorNotificationApproval extends Component {
	state = {
		isError: false
	}

	onCodeSubmit = ( e ) => {
		this.setState( {
			isError: ! this.state.isError
		} );
		e.preventDefault();
	}

	render() {
		const isError = this.state.isError;
		let errorText = null;
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
							<FormLabel htmlFor="verification_code" className="login__form-authenticator-app-code">
								{ this.props.translate( 'Verification Code' ) }
							</FormLabel>
							<FormTextInput
								className={ classNames( 'login__form-verification-code-input', { 'is-error': isError } ) }
								name="verification_code"
								/>
							{
								isError && (
									<FormInputValidation isError={ isError } text={ errorText } />
								)
							}
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="rembemer_me">
								<FormCheckbox name="remember_me" />
								<span>
									{ this.props.translate( 'Remember for 30 days' ) }
								</span>
							</FormLabel>
						</FormFieldset>
						<FormButtonsBar>
							<FormButton primary>{ this.props.translate( 'Log in' ) }</FormButton>
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

export default connect( null, {} )( localize( WaitingTwoFactorNotificationApproval ) );
