import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, FormLabel } from '@automattic/components';
import {
	getEmailAddressError,
	getEmailDomain,
	suggestEmailCorrection,
} from '@automattic/onboarding';
import { debounce } from '@wordpress/compose';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { withBlackboxProtection } from 'calypso/blocks/login/with-blackbox-protection';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import LoggedOutFormFooter from 'calypso/components/logged-out-form/footer';
import Notice from 'calypso/components/notice';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import { isThrottledError, getThrottledErrorMessage } from 'calypso/lib/signup/is-throttled-error';
import wpcom from 'calypso/lib/wp';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import SignupSubmitButton from './signup-submit-button';

class PasswordlessSignupForm extends Component {
	static propTypes = {
		blackbox: PropTypes.shape( {
			isSubmitBlocked: PropTypes.bool.isRequired,
			challenge: PropTypes.node.isRequired,
			getSessionId: PropTypes.func.isRequired,
			reset: PropTypes.func.isRequired,
		} ).isRequired,
		locale: PropTypes.string,
		inputPlaceholder: PropTypes.string,
		submitButtonLabel: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		submitButtonLoadingLabel: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		userEmail: PropTypes.string,
		labelText: PropTypes.string,
		onInputBlur: PropTypes.func,
		onInputChange: PropTypes.func,
		onCreateAccountError: PropTypes.func,
		onCreateAccountSuccess: PropTypes.func,
		disableTosText: PropTypes.bool,
		termsAfterActions: PropTypes.bool,
		// Replaces account creation with a change to the account the caller already has, and
		// reports its own failures.
		onUpdateEmail: PropTypes.func,
		// Names the signup's origin to the backend, which aims the activation link on it.
		activationEmailFrom: PropTypes.string,
		// Holds account creation until the caller is ready — the onboarding account step keeps this on
		// while the email-verification arm loads, so the request can't go out before the arm decides
		// activationEmailFrom. Guards the submit itself, not just the button, so Enter can't slip past.
		isSubmitBlocked: PropTypes.bool,
		useConnectScreenActions: PropTypes.bool,
	};

	static defaultProps = {
		locale: 'en',
		useConnectScreenActions: false,
	};

	state = {
		isSubmitting: false,
		email: this.props.userEmail,
		errorMessages: null,
	};

	submitLock = false;
	formRef = createRef();

	componentDidMount() {
		void this.registerWebMcp();
	}

	componentDidUpdate() {
		void this.webMcpRegistry?.sync().catch( this.reportWebMcpError );
	}

	componentWillUnmount() {
		this.webMcpController?.abort();
		this.webMcpRegistry?.dispose();
	}

	isFormVisible = () => {
		const form = this.formRef.current;
		return Boolean(
			form && form.getClientRects().length && getComputedStyle( form ).visibility !== 'hidden'
		);
	};

	reportWebMcpError = ( error ) => {
		// eslint-disable-next-line no-console
		console.warn( '[WebMCP] Account registration integration failed:', error );
	};

	registerWebMcp = async () => {
		if ( this.props.onUpdateEmail ) {
			return;
		}

		const controller = new AbortController();
		this.webMcpController = controller;
		try {
			const { getWebMcpModelContext, createWebMcpToolRegistry } = await import(
				/* webpackChunkName: "webmcp" */ '@automattic/webmcp'
			);
			if ( controller.signal.aborted ) {
				return;
			}
			const modelContext = getWebMcpModelContext();
			if ( ! modelContext ) {
				return;
			}
			this.webMcpRegistry = createWebMcpToolRegistry( {
				modelContext,
				getTools: () =>
					this.isFormVisible()
						? [
								{
									name: 'wpcom_register_account',
									title: 'Create a WordPress.com account',
									description:
										'Create a real passwordless WordPress.com account with an email address, using this signup form and its validation and anti-abuse checks. Requires the account owner to agree to the terms shown on screen. May send a verification email. Continues the current signup flow after account creation.',
									inputSchema: {
										type: 'object',
										properties: {
											email: {
												type: 'string',
												format: 'email',
												description: 'Email for the new account.',
											},
											acceptTermsOfService: {
												type: 'boolean',
												const: true,
												description:
													'The account owner agrees to the terms shown on the signup screen.',
											},
										},
										required: [ 'email', 'acceptTermsOfService' ],
										additionalProperties: false,
									},
									annotations: { readOnlyHint: false, consequentialHint: true },
									execute: this.registerAccountFromTool,
								},
							]
						: [],
			} );
			await this.webMcpRegistry.sync();
		} catch ( error ) {
			this.reportWebMcpError( error );
		}
	};

	registerAccountFromTool = async ( { email, acceptTermsOfService } ) => {
		const error = ( text ) => ( { isError: true, content: [ { type: 'text', text } ] } );
		if ( acceptTermsOfService !== true ) {
			return error( 'The account owner must agree to the terms shown on the signup screen.' );
		}
		if ( typeof email !== 'string' || getEmailAddressError( email.trim() ) ) {
			return error( 'Provide a valid email address for the new account.' );
		}
		if (
			! this.isFormVisible() ||
			this.props.onUpdateEmail ||
			this.props.disabled ||
			this.props.disableSubmitButton ||
			this.props.isSubmitBlocked ||
			this.props.blackbox.isSubmitBlocked ||
			this.submitLock ||
			this.webMcpRequestPending
		) {
			return error( 'Signup is not ready. Check the form for a pending request or challenge.' );
		}

		this.webMcpRequestPending = true;
		const controller = this.webMcpController;
		try {
			await new Promise( ( resolve ) =>
				this.setState( { email: email.trim(), errorMessages: null }, resolve )
			);
			if ( controller.signal.aborted ) {
				return error( 'The signup form is no longer active.' );
			}
			const created = await this.submitEmail();
			if ( created !== true ) {
				return error(
					typeof created?.message === 'string'
						? `${ created.errorCode || 'signup_failed' }: ${ created.message }`
						: 'Account creation did not finish. Check the page for validation, errors, or a challenge.'
				);
			}
			return {
				content: [
					{ type: 'text', text: 'Account created. Continue with the current signup step.' },
				],
			};
		} finally {
			this.webMcpRequestPending = false;
		}
	};

	submitTracksEvent = ( isSuccessful, props ) => {
		const tracksEventName = isSuccessful
			? 'calypso_signup_actions_onboarding_passwordless_login_success'
			: 'calypso_signup_actions_onboarding_passwordless_login_error';
		this.props.recordTracksEvent( tracksEventName, {
			...props,
		} );
	};

	onFormSubmit = ( event ) => {
		event.preventDefault();
		return this.submitEmail();
	};

	submitEmail = async () => {
		if ( this.props.isSubmitBlocked || this.props.blackbox.isSubmitBlocked || this.submitLock ) {
			return;
		}

		const email = this.getTrimmedEmail();
		const emailError = getEmailAddressError( email );
		if ( emailError ) {
			this.setState( {
				errorMessages: [ this.getEmailErrorMessage( emailError, email ) ],
				isSubmitting: false,
			} );
			if ( ! this.props.onUpdateEmail ) {
				this.submitTracksEvent( false, {
					action_message:
						emailError === 'unknown_tld'
							? 'Email domain does not end in a valid TLD.'
							: 'Please provide a valid email address.',
				} );
			}
			return;
		}

		this.submitLock = true;

		if ( this.props.onUpdateEmail ) {
			this.setState( { isSubmitting: true } );
			try {
				await this.props.onUpdateEmail( email );
			} catch {
				// The caller reports its own failures. This only keeps one it didn't from leaving
				// the screen disabled with nothing to press.
			} finally {
				this.submitLock = false;
				this.setState( { isSubmitting: false } );
			}
			return;
		}

		// Save form state in a format that is compatible with the standard SignupForm used in the user step.
		const form = {
			firstName: '',
			lastName: '',
			email,
			username: '',
			password: '',
		};
		const { activationEmailFrom, flowName, queryArgs = {} } = this.props;

		// If not in a flow, submit the form as a standard signup form.
		// Since it is a passwordless form, we don't need to submit a password.
		if ( flowName === '' && this.props.submitForm ) {
			const blackboxSessionId = await this.props.blackbox.getSessionId();

			// The parent spreads this payload into its /users/new request body.
			this.props.submitForm(
				{
					email,
					is_passwordless: true,
					...( blackboxSessionId && { blackbox_session_id: blackboxSessionId } ),
				},
				( error ) => {
					this.submitLock = false;
					// The handed-off session was consumed by the parent's failed
					// request; reset so a retry gets a verifiable one.
					if ( error ) {
						this.props.blackbox.reset();
					}
				}
			);
			return;
		}
		this.setState( {
			isSubmitting: true,
		} );

		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			form,
		} );

		const { oauth2_client_id, oauth2_redirect } = queryArgs;

		// I'm not sure why passwordless signup form stopped respecting flowName from variationName param,
		// see https://github.com/Automattic/wp-calypso/pull/67225 for more details.
		// I'm going to add a temporary hack for entrepreneur flow.
		const signup_flow_name = queryArgs.variationName === 'entrepreneur' ? 'entrepreneur' : flowName;

		try {
			const blackboxSessionId = await this.props.blackbox.getSessionId();

			const body = {
				email: this.getTrimmedEmail(),
				is_passwordless: true,
				signup_flow_name: signup_flow_name,
				validate: false,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				...( ( flowName === 'wpcc' || flowName === 'crowdsignal' ) && {
					oauth2_client_id,
					oauth2_redirect: oauth2_redirect && `0@${ oauth2_redirect }`,
				} ),
				anon_id: getTracksAnonymousUserId(),
				extra: {
					has_segmentation_survey: queryArgs.variationName === 'entrepreneur',
					...( activationEmailFrom && { from: activationEmailFrom } ),
				},
				...( blackboxSessionId && { blackbox_session_id: blackboxSessionId } ),
			};

			const { search = '' } = typeof window !== 'undefined' ? window.location : {};
			const queryParams = new URLSearchParams( search );
			const ref = queryParams.get( 'ref' );

			if ( ref ) {
				body.ref = ref;
			}

			const response = await wpcom.req.post( '/users/new', body );

			this.createAccountCallback( response );
			return true;
		} catch ( error ) {
			this.createAccountError( error );
			return { errorCode: error.error, message: error.message };
		}
	};

	createAccountError = async ( error ) => {
		this.submitLock = false;
		this.submitTracksEvent( false, { action_message: error.message, error_code: error.error } );

		// Reset Blackbox so the next signup attempt gets a fresh session.
		this.props.blackbox.reset();

		if ( ! isExistingAccountError( error.error ) ) {
			if ( isThrottledError( error.error ) ) {
				this.setState( {
					errorMessages: [ getThrottledErrorMessage( this.props.translate ) ],
				} );
			} else {
				this.setState( {
					errorMessages: [
						this.props.translate(
							'We couldn’t create your account with this email. Please try a different email, or {{a}}contact support{{/a}} if the problem persists.',
							{
								components: {
									a: (
										<a
											href="https://wordpress.com/help/contact"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						),
					],
				} );
			}
		}

		this.setState( {
			isSubmitting: false,
		} );

		this.props.onCreateAccountError?.( error, this.getTrimmedEmail() );
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
			email: this.getTrimmedEmail(),
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
			is_new_account: true,
			...( [ 'wpcc', 'crowdsignal' ].includes( flowName )
				? { oauth2_client_id, oauth2_redirect }
				: { redirect: redirect_to } ),
		} );

		if ( this.props.onCreateAccountSuccess ) {
			return this.props.onCreateAccountSuccess( userData );
		}
	};

	submitStep = ( data ) => {
		const { flowName, stepName, goToNextStep, submitCreateAccountStep, passDataToNextStep } =
			this.props;
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
		if ( passDataToNextStep ) {
			goToNextStep( data );
		} else {
			goToNextStep();
		}
	};

	getTrimmedEmail = () => ( typeof this.state.email === 'string' ? this.state.email.trim() : '' );

	getEmailErrorMessage = ( emailError, email ) => {
		if ( emailError === 'unknown_tld' ) {
			return this.props.translate(
				'“%(domain)s” doesn’t look like a real domain. Check the address for typos.',
				{ args: { domain: getEmailDomain( email ) } }
			);
		}
		return this.props.translate( 'Please provide a valid email address.' );
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
								plain
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

	onInputChange = ( event ) => {
		const {
			target: { value },
		} = event;

		this.debouncedEmailSuggestion( value );
		this.setState( {
			email: value,
			errorMessages: null,
		} );
		this.props.onInputChange?.( event );
	};

	onInputBlur = ( event ) => {
		this.props.onInputBlur?.( event );
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

	formFooter() {
		const { isSubmitting } = this.state;
		// A challenge raised by the submit's own collect holds account creation until
		// it is solved, so stop claiming the account is being created.
		const isCreatingAccount = isSubmitting && ! this.props.blackbox.isSubmitBlocked;
		const isPrimaryDisabled =
			isSubmitting ||
			!! this.props.disabled ||
			!! this.props.disableSubmitButton ||
			!! this.props.isSubmitBlocked ||
			this.props.blackbox.isSubmitBlocked;
		const submitButtonText = isCreatingAccount
			? this.props.submitButtonLoadingLabel || this.props.translate( 'Creating your account…' )
			: this.props.submitButtonLabel || this.props.translate( 'Create your account' );

		if ( this.props.useConnectScreenActions ) {
			return (
				<>
					<ActionButtons
						className="signup-form__action-buttons"
						primaryLabel={ submitButtonText }
						primaryType="submit"
						primaryLoading={ isCreatingAccount }
						primaryDisabled={ isPrimaryDisabled }
					/>
					{ this.props.secondaryFooterButton }
				</>
			);
		}

		return (
			<LoggedOutFormFooter>
				<SignupSubmitButton isBusy={ isCreatingAccount } isDisabled={ isPrimaryDisabled }>
					{ submitButtonText }
				</SignupSubmitButton>
				{ this.props.secondaryFooterButton }
			</LoggedOutFormFooter>
		);
	}

	getLabelText() {
		return this.props.labelText ?? this.props.translate( 'Enter your email address' );
	}

	render() {
		const { errorMessages, isSubmitting } = this.state;

		const terms = ! this.props.disableTosText && this.props.renderTerms?.();

		return (
			<div className="signup-form__passwordless-form-wrapper" ref={ this.formRef }>
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
							onBlur={ this.onInputBlur }
							disabled={ isSubmitting || !! this.props.disabled }
							placeholder={ this.props.inputPlaceholder }
							// eslint-disable-next-line jsx-a11y/no-autofocus -- It's the only field on the page
							autoFocus
						/>
						{ this.props.children }
					</ValidationFieldset>
					{ this.props.blackbox.challenge }
					{ ! this.props.termsAfterActions && terms }
					{ this.formFooter() }
					{ this.props.termsAfterActions && terms }
				</LoggedOutForm>
			</div>
		);
	}
}
export default connect( null, {
	recordTracksEvent,
	saveSignupStep,
	submitCreateAccountStep: submitSignupStep,
} )( localize( withBlackboxProtection( PasswordlessSignupForm, { feature: 'blackbox-signup' } ) ) );
