/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getSavedVariations } from 'lib/abtest';
import wpcom from 'lib/wp';
import { recordRegistration } from 'lib/analytics/signup';
import { recordGoogleRecaptchaAction } from 'lib/analytics/recaptcha';
import { Button } from '@automattic/components';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import ValidationFieldset from 'signup/validation-fieldset';
import { recordTracksEvent } from 'state/analytics/actions';
import Notice from 'components/notice';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import flows from 'signup/config/flows';

class PasswordlessSignupForm extends Component {
	static propTypes = {
		locale: PropTypes.string,
	};

	static defaultProps = {
		locale: 'en',
	};

	state = {
		isSubmitting: false,
		email: this.props.step && this.props.step.form ? this.props.step.form.email : '',
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

	onFormSubmit = async event => {
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

		// Save form state in a format that is compatible with the standard SignupForm used in the user step.
		const form = {
			firstName: '',
			lastName: '',
			email: this.state.email,
			username: '',
			password: '',
		};

		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			form,
		} );

		const isRecaptchaLoaded = typeof this.props.recaptchaClientId === 'number';

		let recaptchaToken = undefined;
		let recaptchaError = undefined;

		if ( flows.getFlow( this.props.flowName )?.showRecaptcha ) {
			if ( isRecaptchaLoaded ) {
				recaptchaToken = await recordGoogleRecaptchaAction(
					this.props.recaptchaClientId,
					'calypso/signup/formSubmit'
				);

				if ( ! recaptchaToken ) {
					recaptchaError = 'recaptcha_failed';
				}
			} else {
				recaptchaError = 'recaptcha_didnt_load';
			}
		}

		try {
			const response = await wpcom.undocumented().usersNew(
				{
					email: typeof this.state.email === 'string' ? this.state.email.trim() : '',
					'g-recaptcha-error': recaptchaError,
					'g-recaptcha-response': recaptchaToken || undefined,
					is_passwordless: true,
					signup_flow_name: this.props.flowName,
					validate: false,
					ab_test_variations: getSavedVariations(),
				},
				null
			);
			this.createAccountCallback( null, response );
		} catch ( err ) {
			this.createAccountCallback( err );
		}
	};

	createAccountCallback = ( error, response ) => {
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

		const username =
			( response && response.signup_sandbox_username ) || ( response && response.username );

		const userId =
			( response && response.signup_sandbox_user_id ) || ( response && response.user_id );

		const userData = {
			ID: userId,
			username: username,
			email: this.state.email,
		};

		recordRegistration( {
			userData,
			flow: this.props.flowName,
			type: 'passwordless',
		} );

		this.submitStep( {
			username,
			bearer_token: response.bearer_token,
		} );
	};

	getErrorMessage( errorObj = { error: null, message: null } ) {
		const { translate } = this.props;

		switch ( errorObj.error ) {
			case 'already_taken':
			case 'already_active':
			case 'email_exists':
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
				return translate(
					'Sorry, something went wrong when trying to create your account. Please try again.'
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

	userCreationComplete() {
		return this.props.step && 'completed' === this.props.step.status;
	}

	formFooter() {
		const { isSubmitting, isEmailAddressValid } = this.state;
		if ( this.userCreationComplete() ) {
			return (
				<LoggedOutFormFooter>
					<Button primary onClick={ () => this.props.goToNextStep() }>
						{ this.props.translate( 'Continue' ) }
					</Button>
				</LoggedOutFormFooter>
			);
		}
		const submitButtonText = isSubmitting
			? this.props.translate( 'Creating Your Account…' )
			: this.props.translate( 'Create your account' );
		return (
			<LoggedOutFormFooter>
				<Button
					type="submit"
					primary
					busy={ isSubmitting }
					disabled={
						isSubmitting ||
						! isEmailAddressValid ||
						!! this.props.disabled ||
						!! this.props.disableSubmitButton
					}
				>
					{ submitButtonText }
				</Button>
			</LoggedOutFormFooter>
		);
	}

	render() {
		const { translate } = this.props;
		const { errorMessages, isSubmitting } = this.state;

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
							value={ this.state.email }
							onChange={ this.onInputChange }
							disabled={ isSubmitting || !! this.props.disabled }
						/>
					</ValidationFieldset>
					{ this.props.renderTerms() }
					{ this.formFooter() }
				</LoggedOutForm>
			</div>
		);
	}
}
export default connect( null, {
	recordTracksEvent,
	saveSignupStep,
	submitCreateAccountStep: submitSignupStep,
} )( localize( PasswordlessSignupForm ) );
