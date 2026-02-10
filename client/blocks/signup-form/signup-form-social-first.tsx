import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useState, createInterpolateElement } from '@wordpress/element';
import { chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { FormDivider } from 'calypso/blocks/authentication';
import { isGravatarOAuth2Client } from 'calypso/lib/oauth2-clients';
import { AccountCreateReturn } from 'calypso/lib/signup/api/type';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import PasswordlessSignupForm from './passwordless';
import SocialSignupForm from './social';
import './style.scss';

interface QueryArgs {
	redirect_to?: string;
}

interface SignupFormSocialFirst {
	goToNextStep: ( data: AccountCreateReturn ) => void;
	stepName: string;
	flowName: string;
	redirectToAfterLoginUrl: string;
	logInUrl: string;
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
	onCreateAccountSuccess?: ( data: AccountCreateReturn ) => void;
	queryArgs: QueryArgs;
	userEmail: string;
	notice: JSX.Element | false;
	isSocialFirst: boolean;
	backButtonInFooter?: boolean;
	passDataToNextStep?: boolean;
	emailLabelText?: string;
	isExperimentVariant?: boolean;
	isEmailVariation?: boolean;
	isMessagingVariation?: boolean;
	isSliderVariation?: boolean;
	allowedSocialServices?: string[];
	customTosElement?: JSX.Element;
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

type Screen = 'initial' | 'email';

const SignupFormSocialFirst = ( {
	goToNextStep,
	stepName,
	flowName,
	redirectToAfterLoginUrl,
	logInUrl,
	socialServiceResponse,
	handleSocialResponse,
	onCreateAccountSuccess,
	queryArgs,
	userEmail,
	notice,
	isSocialFirst,
	passDataToNextStep,
	backButtonInFooter = true,
	emailLabelText,
	isExperimentVariant,
	isEmailVariation,
	isMessagingVariation,
	isSliderVariation,
	allowedSocialServices,
	customTosElement,
}: SignupFormSocialFirst ) => {
	const [ currentStep, setCurrentStep ] = useState< Screen >( userEmail ? 'email' : 'initial' );
	const { __ } = useI18n();
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWoo = useSelector( getIsWoo );
	const isGravatar = isGravatarOAuth2Client( oauth2Client );

	const renderTermsOfService = () => {
		// Custom ToS element takes priority (from partner branding)
		if ( customTosElement ) {
			return <p className="signup-form-social-first__tos-link">{ customTosElement }</p>;
		}

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
		} else if ( isMessagingVariation ) {
			tosText = __( 'Sign up for free to start creating your site.' );
		} else {
			tosText = createInterpolateElement(
				__(
					'By continuing with any of the options listed, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
				),
				options
			);
		}

		return (
			<p
				className={ clsx( 'signup-form-social-first__tos-link', {
					'is-left-aligned': isExperimentVariant,
				} ) }
			>
				{ tosText }
			</p>
		);
	};

	const renderEmailStepTermsOfService = () => {
		return isMessagingVariation ? null : (
			<p className="signup-form-social-first__email-tos-link">
				{ createInterpolateElement(
					__(
						'By clicking "Continue," you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
					),
					options
				) }
			</p>
		);
	};

	// This component uses a technique from this video https://www.youtube.com/watch?v=8327_1PINWI
	// to handle the visibility of the steps while preserving their layout properties and avoiding shifts.
	const getVisibilityClassName = ( step: Screen ) => {
		return clsx( 'signup-form-social-first-screen', {
			visible: currentStep === step,
		} );
	};

	let emailLoginComponent = null;
	if ( isEmailVariation ) {
		emailLoginComponent = (
			<>
				<div className="signup-form-social-first-email">
					<PasswordlessSignupForm
						stepName={ stepName }
						flowName={ flowName }
						goToNextStep={ goToNextStep }
						logInUrl={ logInUrl }
						queryArgs={ queryArgs }
						labelText={ emailLabelText ?? __( 'Your email' ) }
						submitButtonLabel={ __( 'Continue' ) }
						userEmail={ userEmail }
						passDataToNextStep={ passDataToNextStep }
						onCreateAccountError={ ( error: { error: string }, email: string ) => {
							if ( isExistingAccountError( error.error ) ) {
								window.location.assign(
									addQueryArgs(
										{
											email_address: email,
											is_signup_existing_account: true,
											redirect_to: queryArgs?.redirect_to,
										},
										logInUrl
									)
								);
							}
						} }
						onCreateAccountSuccess={ onCreateAccountSuccess }
						inputPlaceholder={ isGravatar ? __( 'Enter your email address' ) : undefined }
						submitButtonLoadingLabel={ isGravatar ? __( 'Continue' ) : undefined }
					/>
				</div>
				<FormDivider isHorizontal />
			</>
		);
	}

	return (
		<div className="signup-form signup-form-social-first">
			<div className={ getVisibilityClassName( 'initial' ) }>
				{ notice }
				{ renderTermsOfService() }
				{ emailLoginComponent }
				<SocialSignupForm
					handleResponse={ handleSocialResponse }
					setCurrentStep={ setCurrentStep }
					socialServiceResponse={ socialServiceResponse }
					redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
					disableTosText
					compact
					isSocialFirst={ isSocialFirst }
					shouldShowEmailButton={ ! isEmailVariation }
					allowedSocialServices={ allowedSocialServices }
				/>
				{ isSliderVariation && (
					<p className="signup-form-social-first__login-link">
						Have an account? <Step.LinkButton href={ logInUrl }>{ __( 'Log in' ) }</Step.LinkButton>
					</p>
				) }
			</div>
			<div className={ getVisibilityClassName( 'email' ) }>
				<div className="signup-form-social-first-email">
					<PasswordlessSignupForm
						stepName={ stepName }
						flowName={ flowName }
						goToNextStep={ goToNextStep }
						logInUrl={ logInUrl }
						queryArgs={ queryArgs }
						labelText={ emailLabelText ?? __( 'Your email' ) }
						submitButtonLabel={ __( 'Continue' ) }
						userEmail={ userEmail }
						renderTerms={ renderEmailStepTermsOfService }
						secondaryFooterButton={
							backButtonInFooter ? undefined : (
								<Button onClick={ () => setCurrentStep( 'initial' ) } icon={ chevronLeft }>
									{ __( 'See all options' ) }
								</Button>
							)
						}
						passDataToNextStep={ passDataToNextStep }
						onCreateAccountError={ ( error: { error: string }, email: string ) => {
							if ( isExistingAccountError( error.error ) ) {
								window.location.assign(
									addQueryArgs(
										{
											email_address: email,
											is_signup_existing_account: true,
											redirect_to: queryArgs?.redirect_to,
										},
										logInUrl
									)
								);
							}
						} }
						onCreateAccountSuccess={ onCreateAccountSuccess }
						inputPlaceholder={ isGravatar ? __( 'Enter your email address' ) : undefined }
						submitButtonLoadingLabel={ isGravatar ? __( 'Continue' ) : undefined }
					/>
					{ backButtonInFooter ? (
						<Button
							onClick={ () => setCurrentStep( 'initial' ) }
							className="back-button"
							variant="link"
						>
							<span>{ __( 'Back' ) }</span>
						</Button>
					) : null }
				</div>
			</div>
		</div>
	);
};

export default SignupFormSocialFirst;
