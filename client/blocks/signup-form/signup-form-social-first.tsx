import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useState, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { isGravatarOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import PasswordlessSignupForm from './passwordless';
import SocialSignupForm from './social';
import './style.scss';

interface SignupFormSocialFirst {
	goToNextStep: () => void;
	stepName: string;
	flowName: string;
	redirectToAfterLoginUrl: string;
	logInUrl: string;
	socialService: string;
	socialServiceResponse: object;
	handleSocialResponse: (
		service: string,
		access_token: string,
		id_token: string | null,
		userData: {
			password: string;
			email: string;
			extra: { first_name: string; last_name: string; username_hint: string };
		} | null
	) => void;
	isReskinned: boolean;
	queryArgs: object;
	userEmail: string;
	notice: JSX.Element | false;
	isSocialFirst: boolean;
}

const options = {
	tosLink: (
		<a
			href={ localizeUrl( 'https://wordpress.com/tos/' ) }
			onClick={ () => recordTracksEvent( 'calypso_signup_tos_link_click' ) }
			target="_blank"
			rel="noopener noreferrer"
		/>
	),
	privacyLink: (
		<a
			href={ localizeUrl( 'https://automattic.com/privacy/' ) }
			onClick={ () => recordTracksEvent( 'calypso_signup_privacy_link_click' ) }
			target="_blank"
			rel="noopener noreferrer"
		/>
	),
};

const SignupFormSocialFirst = ( {
	goToNextStep,
	stepName,
	flowName,
	redirectToAfterLoginUrl,
	logInUrl,
	socialService,
	socialServiceResponse,
	handleSocialResponse,
	isReskinned,
	queryArgs,
	userEmail,
	notice,
	isSocialFirst,
}: SignupFormSocialFirst ) => {
	const [ currentStep, setCurrentStep ] = useState( 'initial' );
	const { __ } = useI18n();
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWooCoreProfilerFlow = useSelector( isWooCommerceCoreProfilerFlow );
	const isWoo = isWooOAuth2Client( oauth2Client ) || isWooCoreProfilerFlow;
	const isGravatar = isGravatarOAuth2Client( oauth2Client );

	const renderTermsOfService = () => {
		let tosText;

		if ( isWoo ) {
			tosText = createInterpolateElement(
				__( 'By continuing, you agree to our <tosLink>Terms of Service</tosLink>.' ),
				options
			);
		} else if ( isGravatar ) {
			tosText = createInterpolateElement(
				__(
					'By entering your email address, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
				),
				options
			);
		} else if ( currentStep === 'initial' ) {
			tosText = createInterpolateElement(
				__(
					'If you continue with Google, Apple or GitHub, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
				),
				options
			);
		}

		return <p className="signup-form-social-first__tos-link">{ tosText }</p>;
	};

	const renderEmailStepTermsOfService = () => {
		if ( currentStep === 'email' ) {
			return (
				<p className="signup-form-social-first__email-tos-link">
					{ createInterpolateElement(
						__(
							'By clicking "Continue," you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
						),
						options
					) }
				</p>
			);
		}
	};

	const renderContent = () => {
		if ( currentStep === 'initial' ) {
			return (
				<>
					{ notice }
					<SocialSignupForm
						handleResponse={ handleSocialResponse }
						setCurrentStep={ setCurrentStep }
						socialService={ socialService }
						socialServiceResponse={ socialServiceResponse }
						isReskinned={ isReskinned }
						redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
						disableTosText
						compact
						isSocialFirst={ isSocialFirst }
					/>
				</>
			);
		} else if ( currentStep === 'email' ) {
			const gravatarProps = isGravatar
				? {
						inputPlaceholder: __( 'Enter your email address' ),
						submitButtonLoadingLabel: __( 'Continue' ),
				  }
				: {};

			return (
				<div className="signup-form-social-first-email">
					<PasswordlessSignupForm
						stepName={ stepName }
						flowName={ flowName }
						goToNextStep={ goToNextStep }
						logInUrl={ logInUrl }
						queryArgs={ queryArgs }
						labelText={ __( 'Your email' ) }
						submitButtonLabel={ __( 'Continue' ) }
						userEmail={ userEmail }
						renderTerms={ renderEmailStepTermsOfService }
						onCreateAccountError={ ( error: { error: string }, email: string ) => {
							if ( isExistingAccountError( error.error ) ) {
								window.location.assign(
									addQueryArgs(
										{
											email_address: email,
											is_signup_existing_account: true,
											redirect_to: window.location.origin + `/setup/${ flowName }`,
										},
										logInUrl
									)
								);
							}
						} }
						{ ...gravatarProps }
					/>
					<Button
						onClick={ () => setCurrentStep( 'initial' ) }
						className="back-button"
						variant="link"
					>
						<span>{ __( 'Back' ) }</span>
					</Button>
				</div>
			);
		}
	};

	return (
		<div className="signup-form signup-form-social-first">
			{ renderContent() }
			{ renderTermsOfService() }
		</div>
	);
};

export default SignupFormSocialFirst;
