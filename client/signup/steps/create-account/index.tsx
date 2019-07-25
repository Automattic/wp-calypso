/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';
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
import { localizeUrl } from 'lib/i18n-utils';
import { submitSignupStep } from 'state/signup/progress/actions';
import { login } from 'lib/paths';
import { getNextStepName, getPreviousStepName, getStepUrl } from 'signup/utils';
import { onboardPasswordlessUser } from 'lib/signup/step-actions';

/**
 * Style dependencies
 */
import './style.scss';

interface RequiredProps {
	flowName: string;
	stepName: string;
	positionInFlow: number;
	submitCreateAccountStep: ( step: object, providedDependencies: object ) => void;
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
}

interface DefaultProps {
	locale: 'en';
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

	onFormSubmit = event => {
		event.preventDefault();

		if ( ! this.state.email || ! emailValidator.validate( this.state.email ) ) {
			this.setState( {
				errorMessages: [ this.props.translate( 'Please provide a valid email address.' ) ],
				isSubmitting: false,
			} );

			return;
		}

		this.setState( {
			isSubmitting: true,
		} );

		onboardPasswordlessUser( this.onboardPasswordlessUserCallback, {
			email: this.state.email,
		} );
	};

	onboardPasswordlessUserCallback = ( error, response ) => {
		if ( error ) {
			const errorMessage = this.getErrorMessage( error );
			this.setState( {
				errorMessages: [ errorMessage ],
				isSubmitting: false,
			} );

			return;
		}

		this.setState( {
			errorMessages: null,
			isSubmitting: false,
		} );

		this.submitStep( response );
	};

	getErrorMessage( errorObj = { error: null, message: null } ) {
		if ( ! errorObj.message || ! errorObj.error ) {
			return null;
		}
		switch ( errorObj.error ) {
			case 'already_taken':
			case 'already_active':
				return (
					<Fragment>
						{ this.props.translate( 'An account with this email address already exists.' ) }
						&nbsp;
						{ this.props.translate( 'If this is you {{a}}log in now{{/a}}.', {
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
				return errorObj.message;
		}
	}

	submitStep = providedDependencies => {
		const { flowName, stepName, goToNextStep, submitCreateAccountStep } = this.props;

		submitCreateAccountStep(
			{
				flowName,
				stepName,
			},
			providedDependencies
		);

		goToNextStep();
	};

	onInputChange = ( { target: { value } } ) =>
		this.setState( {
			email: value,
			errorMessages: null,
		} );

	onClickTermsLink = () => analytics.tracks.recordEvent( 'calypso_signup_tos_link_click' );

	getLoginLink() {
		const { flowName, locale, stepName } = this.props;
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
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ logInUrl }>
					{ translate( 'Log in to create a site for your existing account.' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	}

	renderStepContent() {
		const { translate } = this.props;
		const { email, errorMessages, isSubmitting } = this.state;
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
					<LoggedOutFormFooter>
						<Button
							type="submit"
							primary
							busy={ isSubmitting }
							disabled={ isSubmitting || ! email }
						>
							{ isSubmitting
								? translate( 'Creating your account…' )
								: translate( 'Create your account' ) }
						</Button>
					</LoggedOutFormFooter>
				</LoggedOutForm>
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
				subHeaderText={ translate( 'First, create your WordPress.com account.' ) }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect(
	null,
	{ submitCreateAccountStep: submitSignupStep }
)( localize( CreateAccount ) );
