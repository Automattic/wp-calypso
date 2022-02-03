import config from '@automattic/calypso-config';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useState, useEffect } from 'react';
import { useTrackModal } from '../../hooks/use-track-modal';
import {
	initGoogleRecaptcha,
	recordGoogleRecaptchaAction,
	recordOnboardingError,
} from '../../lib/analytics';
import {
	useLangRouteParam,
	usePath,
	Step,
	useCurrentStep,
	useAnchorFmParams,
	useIsAnchorFm,
} from '../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import './style.scss';
import SignupAnchorLayout from './signup-anchor-layout';
import SignupDefaultLayout from './signup-default-layout';
import type { FormEvent } from 'react';

interface Props {
	onRequestClose: () => void;
}

const SignupForm = ( { onRequestClose }: Props ) => {
	const { __ } = useI18n();
	const [ emailVal, setEmailVal ] = useState( '' );
	const [ passwordVal, setPasswordVal ] = useState( '' );
	const [ recaptchaClientId, setRecaptchaClientId ] = useState< number >();
	const { createAccount, clearErrors } = useDispatch( USER_STORE );
	const isFetchingNewUser = useSelect( ( select ) => select( USER_STORE ).isFetchingNewUser() );
	const newUserError = useSelect( ( select ) => select( USER_STORE ).getNewUserError() );
	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();
	const langParam = useLangRouteParam();
	const makePath = usePath();
	const currentStep = useCurrentStep();
	const isMobile = useViewportMatch( 'small', '<' );
	const { anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl } = useAnchorFmParams();
	const isAnchorFmSignup = useIsAnchorFm();

	const closeModal = () => {
		clearErrors();
		onRequestClose();
	};

	useTrackModal( 'Signup' );

	const lang = useLangRouteParam();
	const localizeUrl = useLocalizeUrl();

	useEffect( () => {
		initGoogleRecaptcha( 'g-recaptcha', config( 'google_recaptcha_site_key' ) ).then(
			( clientId ) => {
				if ( clientId === null ) {
					return;
				}
				setRecaptchaClientId( clientId );
			}
		);
	}, [ setRecaptchaClientId ] );

	const handleSignUp = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const username_hint = siteTitle || null;

		let recaptchaToken;
		let recaptchaError;

		if ( typeof recaptchaClientId === 'number' ) {
			recaptchaToken = await recordGoogleRecaptchaAction(
				recaptchaClientId,
				'calypso/signup/formSubmit'
			);

			if ( ! recaptchaToken ) {
				recaptchaError = 'recaptcha_failed';
			}
		} else {
			recaptchaError = 'recaptcha_didnt_load';
		}

		const result = await createAccount( {
			email: emailVal,
			'g-recaptcha-error': recaptchaError,
			'g-recaptcha-response': recaptchaToken || undefined,
			password: passwordVal,
			signup_flow_name: 'gutenboarding',
			locale: langParam,
			extra: { username_hint, is_anchor_fm_signup: isAnchorFmSignup },
			is_passwordless: false,
		} );

		if ( result.ok ) {
			closeModal();
		} else {
			recordOnboardingError( {
				step: 'account_creation',
				error: result.newUserError.error || 'signup_form_new_user_error',
			} );
		}
	};

	const localizedTosLink = localizeUrl( 'https://wordpress.com/tos/' );

	const tos = createInterpolateElement(
		__( 'By creating an account you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
		{
			link_to_tos: <ExternalLink href={ localizedTosLink } />,
		}
	);

	// translators: English wording comes from Google: https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed
	const recaptcha_text = __(
		'This site is protected by reCAPTCHA and the Google <link_to_policy>Privacy Policy</link_to_policy> and <link_to_tos>Terms of Service</link_to_tos> apply.'
	);
	const recaptcha_tos = createInterpolateElement( recaptcha_text, {
		link_to_policy: <ExternalLink href="https://policies.google.com/privacy" />,
		link_to_tos: <ExternalLink href="https://policies.google.com/terms" />,
	} );

	let errorMessage: string | undefined;
	if ( newUserError ) {
		switch ( newUserError.error ) {
			case 'already_taken':
			case 'already_active':
			case 'email_exists':
			case 'email_reserved':
				errorMessage = __( 'An account with this email address already exists.' );
				break;
			case 'email_invalid':
				errorMessage = __( 'Please enter a valid email address.' );
				break;
			case 'email_cant_be_used_to_signup':
				errorMessage = __(
					'You cannot use that email address to signup. We are having problems with them blocking some of our email. Please use another email provider.'
				);
				break;
			case 'email_not_allowed':
				errorMessage = __( 'Sorry, that email address is not allowed!' );
				break;
			case 'password_invalid':
				errorMessage = newUserError.message;
				break;
			default:
				errorMessage = __(
					'Sorry, something went wrong when trying to create your account. Please try again.'
				);
				break;
		}
	}

	const langFragment = lang ? `/${ lang }` : '';

	const addAnchorQueryParts = ( url: string ): string => {
		const queryParts = {
			anchor_podcast: anchorFmPodcastId,
			anchor_episode: anchorFmEpisodeId,
			spotify_url: anchorFmSpotifyUrl,
		};
		for ( const [ k, v ] of Object.entries( queryParts ) ) {
			if ( v ) {
				url += `&${ k }=${ encodeURIComponent( v ) }`;
			}
		}
		return url;
	};

	let loginRedirectUrl = window.location.origin + '/new';
	if ( isAnchorFmSignup ) {
		loginRedirectUrl += `${ makePath( Step.IntentGathering ) }?new`;
		loginRedirectUrl = addAnchorQueryParts( loginRedirectUrl );
	} else {
		loginRedirectUrl += `${ makePath( Step.CreateSite ) }?new`;
	}
	loginRedirectUrl = encodeURIComponent( loginRedirectUrl );

	let signupUrl = `/new${ makePath( Step[ currentStep ] ) }?signup`;
	if ( isAnchorFmSignup ) {
		signupUrl = addAnchorQueryParts( signupUrl );
	}
	signupUrl = encodeURIComponent( signupUrl );
	const loginUrl = `/log-in/new${ langFragment }?redirect_to=${ loginRedirectUrl }&signup_url=${ signupUrl }`;

	const displayProps = {
		closeModal,
		emailVal,
		errorMessage,
		handleSignUp,
		isFetchingNewUser,
		isMobile,
		loginUrl,
		passwordVal,
		recaptcha_tos,
		setEmailVal,
		setPasswordVal,
		tos,
	};
	return isAnchorFmSignup ? (
		<SignupAnchorLayout { ...displayProps } />
	) : (
		<SignupDefaultLayout { ...displayProps } />
	);
};

export default SignupForm;
