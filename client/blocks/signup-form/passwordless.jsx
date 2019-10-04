/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import ValidationFieldset from 'signup/validation-fieldset';
import { createUserAccountFromEmailAddress } from 'lib/signup/step-actions';
import { recordTracksEvent } from 'state/analytics/actions';
import Notice from 'components/notice';
import { submitSignupStep } from 'state/signup/progress/actions';

export class PasswordlessSignupForm extends Component {
	static defaultProps = {
		locale: 'en',
	};

	state = {
		isSubmitting: false,
		email: '',
		errorMessages: null,
	};

	submitTracksEvent = ( isSuccessful, props ) => {
		const tracksEventName = isSuccessful
			? 'calypso_signup_actions_onboarding_passwordless_login_success'
			: 'calypso_signup_actions_onboarding_passwordless_login_error';
		this.props.recordTracksEvent( tracksEventName, {
			...props,
		} );
	};

	onFormSubmit = event => {
		event.preventDefault();

		if ( ! this.state.email || ! emailValidator.validate( this.state.email ) ) {
			this.setState( {
				errorMessages: [ this.props.translate( 'Please provide a valid email address.' ) ],
				isSubmitting: false,
			} );
			this.submitTracksEvent( false, { action_message: 'Please provide a valid email address.' } );
			return;
		}

		this.setState( {
			isSubmitting: true,
		} );

		createUserAccountFromEmailAddress( this.createUserAccountFromEmailAddressCallback, {
			email: typeof this.state.email === 'string' ? this.state.email.trim() : '',
		} );
	};

	createUserAccountFromEmailAddressCallback = ( error, response ) => {
		if ( error ) {
			const errorMessage = this.getErrorMessage( error );
			this.setState( {
				errorMessages: [ errorMessage ],
				isSubmitting: false,
			} );
			this.submitTracksEvent( false, { action_message: error.message } );
			return;
		}

		this.setState( {
			errorMessages: null,
			isSubmitting: false,
		} );

		this.submitStep( response );
	};

	getErrorMessage( errorObj = { error: null, message: null } ) {
		const { translate } = this.props;

		switch ( errorObj.error ) {
			case 'already_taken':
			case 'already_active':
				return (
					<>
						{ translate( 'An account with this email address already exists.' ) }
						&nbsp;
						{ translate( 'If this is you {{a}}log in now{{/a}}.', {
							components: {
								a: (
									<a
										href={ `${ this.props.logInUrl }&email_address=${ encodeURIComponent(
											this.state.email
										) }` }
									/>
								),
							},
						} ) }
					</>
				);
			default:
				return (
					errorObj.message ||
					translate(
						'Sorry, something went wrong when trying to create your account. Please try again.'
					)
				);
		}
	}
	submitStep = data => {
		const { flowName, stepName, goToNextStep, submitCreateAccountStep } = this.props;
		submitCreateAccountStep(
			{
				flowName,
				stepName,
				// We use this flag in the flow controller to communicate to the flow controller that we're
				// dealing with passwordless signup, and therefore don't need to call the apiFunction
				// normally associated with the user step.
				isPasswordlessSignupForm: true,
			},
			data
		);
		this.submitTracksEvent( true, { action_message: 'Successful login', username: data.username } );
		goToNextStep();
	};
	onInputChange = ( { target: { value } } ) =>
		this.setState( {
			email: value,
			errorMessages: null,
			isEmailAddressValid: emailValidator.validate( value ),
		} );
	renderNotice() {
		return (
			<Notice showDismiss={ false } status="is-error">
				{ this.props.translate(
					'Your account has already been created. You can change your email, username, and password later.'
				) }
			</Notice>
		);
	}
	render() {
		const { translate } = this.props;
		const { errorMessages, isSubmitting, isEmailAddressValid } = this.state;
		const submitButtonText = isSubmitting
			? translate( 'Creating Your Account…' )
			: translate( 'Create your account' );
		return (
			<div className="signup-form__passwordless-form-wrapper">
				<LoggedOutForm onSubmit={ this.onFormSubmit } noValidate>
					<ValidationFieldset errorMessages={ errorMessages }>
						<FormLabel htmlFor="email">{ translate( 'Enter your email address' ) }</FormLabel>
						<FormTextInput
							autoCapitalize={ 'off' }
							className="signup-form__passwordless-email"
							type="email"
							name="email"
							onChange={ this.onInputChange }
							disabled={ isSubmitting }
						/>
					</ValidationFieldset>
					{ this.props.renderTerms() }
					<LoggedOutFormFooter>
						<Button
							type="submit"
							primary
							busy={ isSubmitting }
							disabled={ isSubmitting || ! isEmailAddressValid }
						>
							{ submitButtonText }
						</Button>
					</LoggedOutFormFooter>
				</LoggedOutForm>
			</div>
		);
	}
}
export default connect(
	null,
	{
		recordTracksEvent,
		submitCreateAccountStep: submitSignupStep,
	}
)( localize( PasswordlessSignupForm ) );
