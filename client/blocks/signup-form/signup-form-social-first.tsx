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
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';
import type { JSX } from 'react';
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
	isEmailFirstVariant?: boolean;
	isEmailAtBottom?: boolean;
	isMobileCompactVariant?: boolean;
	allowedSocialServices?: SignupAllowedService[];
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

// ToS copy for the mobile-compact signup layout. Rendered inside the form below
// the sign-up options, kept as its own component so the legal links and the
// translation string live in one location.
export const MobileCompactTosNotice = () => {
	const { __ } = useI18n();
	const tosText = createInterpolateElement(
		__(
			'By continuing with any of the options above, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
		),
		options
	);
	return <p className="signup-form-social-first__tos-link">{ tosText }</p>;
};

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
	isEmailFirstVariant,
	isEmailAtBottom,
	isMobileCompactVariant,
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
					'is-left-aligned': isEmailFirstVariant,
				} ) }
			>
				{ tosText }
			</p>
		);
	};

	const renderEmailStepTermsOfService = () => {
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
	};

	// This component uses a technique from this video https://www.youtube.com/watch?v=8327_1PINWI
	// to handle the visibility of the steps while preserving their layout properties and avoiding shifts.
	const getVisibilityClassName = ( step: Screen ) => {
		return clsx( 'signup-form-social-first-screen', {
			visible: currentStep === step,
		} );
	};

	// Shared by the email-first (Woo or experiment) branch and the mobile-compact
	// branch so the conversion-critical existing-account redirect lives in one place.
	const passwordlessFormProps = {
		stepName,
		flowName,
		goToNextStep,
		logInUrl,
		queryArgs,
		labelText: emailLabelText ?? __( 'Your email' ),
		submitButtonLabel: __( 'Continue' ),
		userEmail,
		passDataToNextStep,
		onCreateAccountError: ( error: { error: string }, email: string ) => {
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
		},
		onCreateAccountSuccess,
		inputPlaceholder: isGravatar ? __( 'Enter your email address' ) : undefined,
		submitButtonLoadingLabel: isGravatar ? __( 'Continue' ) : undefined,
	};

	const emailLoginBlock = isEmailFirstVariant ? (
		<div className="signup-form-social-first-email">
			<PasswordlessSignupForm { ...passwordlessFormProps } />
		</div>
	) : null;

	const loginLinkParagraph = (
		<p className="signup-form-social-first__login-link">
			{ createInterpolateElement( __( 'Have an account? <link>Log in</link>' ), {
				link: <Step.LinkButton href={ logInUrl } />,
			} ) }
		</p>
	);

	if ( isMobileCompactVariant ) {
		// In-form ToS: partner branding wins via customTosElement (rendered by
		// renderTermsOfService); otherwise the compact "options above" notice.
		const inFormTosElement = customTosElement ? renderTermsOfService() : <MobileCompactTosNotice />;
		// Mobile compact: no "Have an account? Log in" link inside the form —
		// the Log in link in the top bar covers that affordance per the Figma.
		return (
			<div className="signup-form signup-form-social-first signup-form-social-first--mobile-compact">
				{ notice }
				<SocialSignupForm
					handleResponse={ handleSocialResponse }
					setCurrentStep={ setCurrentStep }
					socialServiceResponse={ socialServiceResponse }
					redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
					disableTosText
					compact
					isSocialFirst={ isSocialFirst }
					shouldShowEmailButton={ false }
					allowedSocialServices={ allowedSocialServices }
				/>
				<FormDivider isHorizontal />
				<div className="signup-form-social-first-email">
					<PasswordlessSignupForm { ...passwordlessFormProps } />
				</div>
				{ inFormTosElement }
			</div>
		);
	}

	return (
		<div className="signup-form signup-form-social-first">
			<div className={ getVisibilityClassName( 'initial' ) }>
				{ notice }
				{ renderTermsOfService() }
				{ emailLoginBlock && ! isEmailAtBottom && (
					<>
						{ emailLoginBlock }
						<FormDivider isHorizontal />
					</>
				) }
				<SocialSignupForm
					handleResponse={ handleSocialResponse }
					setCurrentStep={ setCurrentStep }
					socialServiceResponse={ socialServiceResponse }
					redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
					disableTosText
					compact
					isSocialFirst={ isSocialFirst }
					shouldShowEmailButton={ ! isEmailFirstVariant }
					allowedSocialServices={ allowedSocialServices }
				/>
				{ emailLoginBlock && isEmailAtBottom && (
					<>
						<FormDivider isHorizontal />
						{ emailLoginBlock }
					</>
				) }
				{ isEmailFirstVariant && loginLinkParagraph }
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
