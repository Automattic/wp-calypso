import { useState, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import SocialFirstAccessList from './social-first-access-list';
import SocialSignupForm from '../signup-form/social';
import GoogleIcon from 'calypso/components/social-icons/google';

import { login } from 'calypso/lib/paths';
import { useSelector } from 'calypso/state';
import { getSectionName } from 'calypso/state/ui/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { get } from 'lodash';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import EmailSignup from './email-signup';
import { isGravatarOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import '../signup-form/style.scss';
import './style.scss';

interface SignupFormSocialFirst {
	goToNextStep: () => void;
	step: string;
	stepName: string;
	flowName: string;
	redirectToAfterLoginUrl: string;
	socialService: string;
	socialServiceResponse: string;
	handleSocialResponse: () => void;
	isReskinned: boolean;
	queryArgs: object;
}

const SignupFormSocialFirst = ( {
	goToNextStep,
	step,
	stepName,
	flowName,
	redirectToAfterLoginUrl,
	socialService,
	socialServiceResponse,
	handleSocialResponse,
	isReskinned,
	queryArgs,
}: SignupFormSocialFirst ) => {
	const [ currentStep, setCurrentStep ] = useState( 'initial' );
	const { __ } = useI18n();
	const localeSlug = useLocale();

	const { sectionName, oauth2Client, from, wccomFrom, isWoo, isGravatar } = useSelector(
		( state ) => {
			const oauth2Client = getCurrentOAuth2Client( state );
			const isWooCoreProfilerFlow = isWooCommerceCoreProfilerFlow( state );

			return {
				sectionName: getSectionName( state ),
				oauth2Client: oauth2Client,
				from: get( getCurrentQueryArguments( state ), 'from' ),
				wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
				isWoo: isWooOAuth2Client( oauth2Client ) || isWooCoreProfilerFlow,
				isGravatar: isGravatarOAuth2Client( oauth2Client ),
			};
		}
	);

	const renderContent = () => {
		if ( currentStep === 'initial' ) {
			return (
				<SocialSignupForm
					handleResponse={ handleSocialResponse }
					socialService={ socialService }
					socialServiceResponse={ socialServiceResponse }
					isReskinned={ true }
					redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
					disableTosText={ true }
                    compact={ true }
				>
					<button
						className="social-buttons__button button"
						onClick={ () => setCurrentStep( 'email' ) }
					>
						<GoogleIcon width="20" height="20" />
						<span className="social-buttons__service-name">{ __( 'Continue with Email' ) }</span>
					</button>
				</SocialSignupForm>
			);
		} else if ( currentStep === 'email' ) {
			const logInUrl = login( {
				isJetpack: 'jetpack-connect' === sectionName,
				from,
				redirectTo: redirectToAfterLoginUrl,
				locale: localeSlug,
				oauth2ClientId: oauth2Client && oauth2Client.id,
				wccomFrom: wccomFrom,
				isWhiteLogin: isReskinned,
				signupUrl: window.location.pathname + window.location.search,
			} );

			return (
				<EmailSignup
					step={ step }
					stepName={ stepName }
					flowName={ flowName }
					goToNextStep={ goToNextStep }
					logInUrl={ logInUrl }
					queryArgs={ queryArgs }
					handleBack={ () => setCurrentStep( 'initial' ) }
					isGravatarOAuth2Client={ isGravatar }
				/>
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
