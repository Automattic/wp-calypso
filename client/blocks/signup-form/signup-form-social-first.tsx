import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useState, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import MailIcon from 'calypso/components/social-icons/mail';
import { isGravatarOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import PasswordlessSignupForm from './passwordless';
import SocialSignupForm from './social';
import './style.scss';

interface SignupFormSocialFirst {
	goToNextStep: () => void;
	step: string;
	stepName: string;
	flowName: string;
	redirectToAfterLoginUrl: string;
	logInUrl: string;
	socialService: string;
	socialServiceResponse: string;
	handleSocialResponse: () => void;
	isReskinned: boolean;
	queryArgs: object;
	userEmail: string;
	notice: JSX.Element | false;
}

const SignupFormSocialFirst = ( {
	goToNextStep,
	step,
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
}: SignupFormSocialFirst ) => {
	const [ currentStep, setCurrentStep ] = useState( 'initial' );
	const { __ } = useI18n();

	const { isWoo, isGravatar } = useSelector( ( state ) => {
		const oauth2Client = getCurrentOAuth2Client( state );
		const isWooCoreProfilerFlow = isWooCommerceCoreProfilerFlow( state );

		return {
			isWoo: isWooOAuth2Client( oauth2Client ) || isWooCoreProfilerFlow,
			isGravatar: isGravatarOAuth2Client( oauth2Client ),
		};
	} );

	const renderContent = () => {
		if ( currentStep === 'initial' ) {
			return (
				<>
					{ notice }
					<SocialSignupForm
						handleResponse={ handleSocialResponse }
						socialService={ socialService }
						socialServiceResponse={ socialServiceResponse }
						isReskinned={ isReskinned }
						redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
						disableTosText={ true }
						compact={ true }
					>
						<Button
							className="social-buttons__button button"
							onClick={ () => setCurrentStep( 'email' ) }
						>
							<MailIcon width="20" height="20" />
							<span className="social-buttons__service-name">{ __( 'Continue with Email' ) }</span>
						</Button>
					</SocialSignupForm>
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
						step={ step }
						stepName={ stepName }
						flowName={ flowName }
						goToNextStep={ goToNextStep }
						logInUrl={ logInUrl }
						queryArgs={ queryArgs }
						labelText={ __( 'Your email' ) }
						submitButtonLabel={ __( 'Continue' ) }
						userEmail={ userEmail }
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

	const renderTermsOfService = () => {
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

		if ( isWoo ) {
			return (
				<p className="signup-form-social-first__tos-link">
					{ createInterpolateElement(
						__( 'By continuing, you agree to our <tosLink>Terms of Service</tosLink>.' ),
						options
					) }
				</p>
			);
		} else if ( isGravatar ) {
			return (
				<p className="signup-form-social-first__tos-link">
					{ createInterpolateElement(
						__(
							'By entering your email address, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
						),
						options
					) }
				</p>
			);
		}

		let tosText;

		if ( currentStep === 'initial' ) {
			tosText = createInterpolateElement(
				__(
					'If you continue with Google or Apple, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
				),
				options
			);
		} else if ( currentStep === 'email' ) {
			tosText = createInterpolateElement(
				__(
					'By creating an account you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
				),
				options
			);
		}

		return <p className="signup-form-social-first__tos-link">{ tosText }</p>;
	};

	return (
		<div className="signup-form signup-form-social-first">
			{ renderContent() }
			{ renderTermsOfService() }
		</div>
	);
};

export default SignupFormSocialFirst;
