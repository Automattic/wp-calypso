import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { suggestEmailCorrection } from '@automattic/onboarding';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import LoggedOutFormFooter from 'calypso/components/logged-out-form/footer';
import Notice from 'calypso/components/notice';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { addQueryArgs } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';

class PasswordlessSignupForm extends Component {
	static propTypes = {
		locale: PropTypes.string,
		inputPlaceholder: PropTypes.string,
		submitButtonLabel: PropTypes.string,
		submitButtonLoadingLabel: PropTypes.string,
		userEmail: PropTypes.string,
	};

	static defaultProps = {
		locale: 'en',
	};

	state = {
		isSubmitting: false,
		email: this.props.userEmail,
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

	onFormSubmit = async ( event ) => {
		event.preventDefault();

		if ( ! this.state.email || ! emailValidator.validate( this.state.email ) ) {
			this.setState( {
				errorMessages: [ this.props.translate( 'Please provide a valid email address.' ) ],
				isSubmitting: false,
			} );
			this.submitTracksEvent( false, { action_message: 'Please provide a valid email address.' } );
			return;
		}

		// Save form state in a format that is compatible with the standard SignupForm used in the user step.
		const form = {
			firstName: '',
			lastName: '',
			email: this.state.email,
			username: '',
			password: '',
		};
		const { flowName, queryArgs = {} } = this.props;

		// If not in a flow, submit the form as a standard signup form.
		// Since it is a passwordless form, we don't need to submit a password.
		if ( flowName === '' && this.props.submitForm ) {
			this.props.submitForm( form, {
				email: this.state.email,
				is_passwordless: true,
				is_dev_account: queryArgs.ref === 'developer-lp',
			} );
			return;
		}
		this.setState( {
			isSubmitting: true,
		} );

		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			form,
		} );

		const { oauth2_client_id, oauth2_redirect, ref } = queryArgs;

		try {
			const response = await wpcom.req.post( '/users/new', {
				email: typeof this.state.email === 'string' ? this.state.email.trim() : '',
				is_passwordless: true,
				signup_flow_name: flowName,
				validate: false,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				...( flowName === 'wpcc' && {
					oauth2_client_id,
					oauth2_redirect: oauth2_redirect && `0@${ oauth2_redirect }`,
				} ),
				anon_id: getTracksAnonymousUserId(),
				is_dev_account: ref === 'developer-lp',
			} );

			this.createAccountCallback( response );
		} catch ( error ) {
			this.createAccountError( error );
		}
	};

	createAccountError = async ( error ) => {
		this.submitTracksEvent( false, { action_message: error.message, error_code: error.error } );

		if ( [ 'already_taken', 'already_active', 'email_exists' ].includes( error.error ) ) {
			page(
				addQueryArgs(
					{
						email_address: this.state.email,
						is_signup_existing_account: true,
					},
					this.props.logInUrl
				)
			);
			return;
		}

		this.setState( {
			errorMessages: [
				this.props.translate(
					'Sorry, something went wrong when trying to create your account. Please try again.'
				),
			],
			isSubmitting: false,
		} );

		return;
	};

	createAccountCallback = ( response ) => {
		this.setState( {
			errorMessages: null,
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

		const marketing_price_group = response?.marketing_price_group ?? '';
		const { flowName, queryArgs = {} } = this.props;
		const { redirect_to, oauth2_client_id, oauth2_redirect } = queryArgs;

		recordRegistration( {
			userData,
			flow: flowName,
			type: 'passwordless',
		} );

		this.submitStep( {
			username,
			marketing_price_group,
			bearer_token: response.bearer_token,
			...( flowName === 'wpcc'
				? { oauth2_client_id, oauth2_redirect }
				: { redirect: redirect_to } ),
		} );
	};

	submitStep = ( data ) => {
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

	handleAcceptDomainSuggestion = ( newEmail, newDomain, oldDomain ) => {
		this.setState( {
			email: newEmail,
			errorMessages: null,
		} );
		this.props.recordTracksEvent( 'calypso_signup_domain_suggestion_confirmation', {
			original_domain: JSON.stringify( oldDomain ),
			suggested_domain: JSON.stringify( newDomain ),
		} );
	};

	handleEmailDomainSuggestionError = ( newEmail, oldEmail, newDomain, oldDomain ) => {
		this.props.recordTracksEvent( 'calypso_signup_domain_suggestion_generated', {
			original_domain: JSON.stringify( oldDomain ),
			suggested_domain: JSON.stringify( newDomain ),
		} );
		this.setState( {
			errorMessages: [
				this.props.translate( 'Did you mean {{emailSuggestion/}}?', {
					components: {
						emailSuggestion: (
							<Button
								plain={ true }
								className="signup-form__domain-suggestion-confirmation"
								onClick={ () => {
									this.handleAcceptDomainSuggestion( newEmail, newDomain, oldDomain );
								} }
							>
								{ newEmail }
							</Button>
						),
					},
				} ),
			],
		} );
	};

	debouncedEmailSuggestion = debounce( ( email ) => {
		if ( emailValidator.validate( email ) ) {
			const { newEmail, oldEmail, newDomain, oldDomain, wasCorrected } =
				suggestEmailCorrection( email );
			if ( wasCorrected ) {
				this.handleEmailDomainSuggestionError( newEmail, oldEmail, newDomain, oldDomain );
				return;
			}
		}
	}, 1000 );

	onInputChange = ( { target: { value } } ) => {
		this.debouncedEmailSuggestion( value );
		this.setState( {
			email: value,
			errorMessages: null,
		} );
	};

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
		const { isSubmitting } = this.state;
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
			? this.props.submitButtonLoadingLabel || this.props.translate( 'Creating Your Account…' )
			: this.props.submitButtonLabel || this.props.translate( 'Create your account' );

		return (
			<LoggedOutFormFooter>
				<Button
					type="submit"
					primary
					busy={ isSubmitting }
					disabled={ isSubmitting || !! this.props.disabled || !! this.props.disableSubmitButton }
				>
					{ submitButtonText }
				</Button>
			</LoggedOutFormFooter>
		);
	}

	getLabelText() {
		return this.props.labelText ?? this.props.translate( 'Enter your email address' );
	}

	render() {
		const { errorMessages, isSubmitting } = this.state;

		return (
			<div className="signup-form__passwordless-form-wrapper">
				<LoggedOutForm onSubmit={ this.onFormSubmit } noValidate>
					<ValidationFieldset errorMessages={ errorMessages }>
						<FormLabel htmlFor="signup-email">{ this.getLabelText() }</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoCorrect="off"
							className="signup-form__passwordless-email"
							type="email"
							name="email"
							id="signup-email"
							value={ this.state.email }
							onChange={ this.onInputChange }
							disabled={ isSubmitting || !! this.props.disabled }
							placeholder={ this.props.inputPlaceholder }
							// eslint-disable-next-line jsx-a11y/no-autofocus -- It's the only field on the page
							autoFocus
						/>
					</ValidationFieldset>
					{ this.props.renderTerms?.() }
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
