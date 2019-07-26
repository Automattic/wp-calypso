/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';
import { get } from 'lodash';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import StepWrapper from 'signup/step-wrapper';
import ValidationFieldset from 'signup/validation-fieldset';
import SocialSignupForm from 'blocks/signup-form/social';
import { localizeUrl } from 'lib/i18n-utils';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { login } from 'lib/paths';
import {
	getNextStepName,
	getPreviousStepName,
	getStepUrl,
	getSocialServiceFromClientId,
} from 'signup/utils';
import { onboardPasswordlessUser } from 'lib/signup/step-actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';

/**
 * Style dependencies
 */
import './style.scss';

interface RequiredProps {
	flowName: string;
	stepName: string;
	positionInFlow: number;
	saveCreateAccountStep: ( { stepName: string } ) => void;
	saveCreateAccountStep: ( step: object, providedDependencies: object ) => void;
	recordTracksEvent: ( event: string, properties: object ) => void;
	goToNextStep: () => any;
	signupProgress: {
		lastKnownFlow: string;
		lastUpdated: number;
		status: string;
		stepName: string;
	}[];
}

interface AcceptedProps {
	locale?: string;
	contextHashObject?: {
		client_id?: string;
	};
	isSocialSignupEnabled?: boolean;
	step: any;
	contextQueryObject: object;
}

interface DefaultProps {
	locale: 'en';
	isSocialSignupEnabled: false;
	contextHashObject: {};
	contextQueryObject: {};
}

interface State {
	isSubmitting: boolean;
	errorMessages: null | any[];
	email: string;
}

type Props = RequiredProps & AcceptedProps & DefaultProps;

export class CreateAccount extends Component< Props & LocalizeProps, State > {
	static defaultProps = {
		locale: 'en',
	};

	state: State = {
		isSubmitting: false,
		email: '',
		errorMessages: null,
	};

	componentDidMount() {
		this.props.saveCreateAccountStep( { stepName: this.props.stepName } );
	}

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 *
	 * @param {String} service      The name of the social service
	 * @param {String} access_token An OAuth2 acccess token
	 * @param {String} id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 */
	handleSocialResponse = ( service, access_token, id_token = null ) => {
		this.submitStep( {
			service,
			access_token,
			id_token,
			queryArgs: this.props.contextQueryObject,
		} );
	};

	userCreationComplete() {
		return this.props.step && 'completed' === this.props.step.status;
	}

	submitTracksEvent = ( isSuccessful, message, isOauth2Signup = false ) =>
		this.props.recordTracksEvent( 'calypso_signup_actions_onboarding_passwordless_login', {
			is_successful: isSuccessful,
			action_message: message,
			is_oauth: isOauth2Signup,
		} );

	onFormSubmit = event => {
		event.preventDefault();

		if ( ! this.state.email || ! emailValidator.validate( this.state.email ) ) {
			this.setState( {
				errorMessages: [ this.props.translate( 'Please provide a valid email address.' ) ],
				isSubmitting: false,
			} );
			this.submitTracksEvent( false, 'Please provide a valid email address.' );
			return;
		}

		this.setState( {
			isSubmitting: true,
		} );

		onboardPasswordlessUser( this.onboardPasswordlessUserCallback, {
			email: typeof this.state.email === 'string' ? this.state.email.trim() : '',
		} );
	};

	onboardPasswordlessUserCallback = ( error, response ) => {
		if ( error ) {
			const errorMessage = this.getErrorMessage( error );
			this.setState( {
				errorMessages: [ errorMessage ],
				isSubmitting: false,
			} );
			this.submitTracksEvent( false, error.message );
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
					<Fragment>
						{ translate( 'An account with this email address already exists.' ) }
						&nbsp;
						{ translate( 'If this is you {{a}}log in now{{/a}}.', {
							components: {
								a: (
									<a
										href={ `${ this.getLoginLink() }&email_address=${ encodeURIComponent(
											this.state.email
										) }` }
									/>
								),
							},
						} ) }
					</Fragment>
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
		const { flowName, stepName, goToNextStep, submitCreateAccountStep, oauth2Signup } = this.props;
		let stepDependencies = {};

		if ( oauth2Signup ) {
			const { oauth2_client_id, oauth2_redirect } = data.queryArgs;
			stepDependencies = {
				oauth2_client_id,
				oauth2_redirect,
			};
		}
		submitCreateAccountStep(
			{
				flowName,
				stepName,
				oauth2Signup,
				...data,
			},
			stepDependencies
		);

		this.submitTracksEvent( true, 'Successful login', !! oauth2Signup );
		goToNextStep();
	};

	onInputChange = ( { target: { value } } ) =>
		this.setState( {
			email: value,
			errorMessages: null,
		} );

	onClickTermsLink = () => analytics.tracks.recordEvent( 'calypso_signup_tos_link_click' );

	getLoginLink() {
		const { flowName, locale, stepName, oauth2Client } = this.props;
		const stepAfterRedirect =
			getNextStepName( flowName, stepName ) || getPreviousStepName( flowName, stepName );

		const originUrl = `${ window.location.protocol }//${ window.location.hostname }${
			window.location.port ? ':' + window.location.port : ''
		}`;
		const redirectTo = originUrl + getStepUrl( flowName, stepAfterRedirect, null, locale );

		return login( {
			isNative: config.isEnabled( 'login/native-login-links' ),
			redirectTo,
			locale,
			oauth2ClientId: oauth2Client && oauth2Client.id,
		} );
	}
	renderTerms() {
		return (
			<p className="create-account__terms-of-service-link">
				{ this.props.translate(
					'By creating an account you agree to our {{a}}Terms of Service{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/tos/' ) }
									onClick={ this.onClickTermsLink }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
		);
	}

	renderFooterLink() {
		const { locale, positionInFlow, translate } = this.props;

		if ( positionInFlow !== 0 ) {
			return;
		}

		const logInUrl = config.isEnabled( 'login/native-login-links' )
			? this.getLoginLink()
			: localizeUrl( config( 'login_url' ), locale );

		return (
			<LoggedOutFormLinks className="create-account__footer-links">
				<LoggedOutFormLinkItem href={ logInUrl }>
					{ translate( 'Log in to create a site for your existing account.' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	}

	renderStepContent() {
		const { translate, isSocialSignupEnabled, contextHashObject } = this.props;
		const { email, errorMessages, isSubmitting } = this.state;
		let socialService, socialServiceResponse;
		if ( isSocialSignupEnabled && contextHashObject.client_id ) {
			const clientId = contextHashObject.client_id;
			socialService = getSocialServiceFromClientId( clientId );
			if ( socialService ) {
				socialServiceResponse = contextHashObject;
			}
		}

		return (
			<div className="create-account__form-wrapper">
				<LoggedOutForm onSubmit={ this.onFormSubmit } noValidate>
					<ValidationFieldset errorMessages={ errorMessages }>
						<FormLabel htmlFor="email">{ translate( 'Enter your email address' ) }</FormLabel>
						<FormTextInput
							autoCapitalize={ 'off' }
							className="create-account__email"
							type="email"
							name="email"
							onChange={ this.onInputChange }
							disabled={ isSubmitting }
						/>
					</ValidationFieldset>
					{ this.renderTerms() }
					<LoggedOutFormFooter>
						<Button
							type="submit"
							primary
							busy={ isSubmitting }
							disabled={ isSubmitting || ! emailValidator.validate( email ) }
						>
							{ isSubmitting
								? translate( 'Creating your account…' )
								: translate( 'Create your account' ) }
						</Button>
					</LoggedOutFormFooter>
				</LoggedOutForm>
				{ isSocialSignupEnabled && ! this.userCreationComplete() && (
					<SocialSignupForm
						handleResponse={ this.handleSocialResponse }
						socialService={ socialService }
						socialServiceResponse={ socialServiceResponse }
					/>
				) }
				{ this.renderFooterLink() }
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ translate( "Let's get started" ) }
				subHeaderText={ translate(
					'All you need to create a WordPress.com account is an email address.'
				) }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		oauth2Client: getCurrentOAuth2Client( state ),
		contextHashObject: get( ownProps.initialContext, 'hash', {} ),
		contextQueryObject: get( ownProps.initialContext, 'query', {} ),
	} ),
	{
		submitCreateAccountStep: submitSignupStep,
		recordTracksEvent,
		saveCreateAccountStep: saveSignupStep,
	}
)( localize( CreateAccount ) );
