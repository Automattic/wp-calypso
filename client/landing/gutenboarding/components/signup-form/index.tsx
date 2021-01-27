/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { Button, ExternalLink, TextControl, Modal, Notice } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import {
	useLangRouteParam,
	usePath,
	Step,
	useCurrentStep,
	useAnchorFmParams,
	useIsAnchorFm,
} from '../../path';
import ModalSubmitButton from '../modal-submit-button';
import './style.scss';
import SignupFormHeader from './header';
import {
	initGoogleRecaptcha,
	recordGoogleRecaptchaAction,
	recordOnboardingError,
} from '../../lib/analytics';
import { localizeUrl } from '../../../../lib/i18n-utils';
import { useTrackModal } from '../../hooks/use-track-modal';
import config from '@automattic/calypso-config';

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
	const { siteTitle, siteVertical } = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();
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

	useEffect( () => {
		initGoogleRecaptcha(
			'g-recaptcha',
			'calypso/signup/pageLoad',
			config( 'google_recaptcha_site_key' )
		).then( ( result ) => {
			if ( ! result ) {
				return;
			}
			setRecaptchaClientId( result.clientId );
		} );
	}, [ setRecaptchaClientId ] );

	const handleSignUp = async ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const username_hint = siteTitle || siteVertical?.label || null;

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

	let loginRedirectUrl = window.location.origin + '/new';
	if ( isAnchorFmSignup ) {
		loginRedirectUrl += `${ makePath( Step.IntentGathering ) }?new`;
		const queryParts = {
			anchor_podcast: anchorFmPodcastId,
			anchor_episode: anchorFmEpisodeId,
			spotify_url: anchorFmSpotifyUrl,
		};
		for ( const [ k, v ] of Object.entries( queryParts ) ) {
			if ( v ) {
				loginRedirectUrl += `&${ k }=${ encodeURIComponent( v ) }`;
			}
		}
	} else {
		loginRedirectUrl += `${ makePath( Step.CreateSite ) }?new`;
	}
	loginRedirectUrl = encodeURIComponent( loginRedirectUrl );

	const signupUrl = encodeURIComponent( `/new${ makePath( Step[ currentStep ] ) }?signup` );
	const loginUrl = `/log-in/new${ langFragment }?redirect_to=${ loginRedirectUrl }&signup_url=${ signupUrl }`;

	return (
		<Modal
			className={ 'signup-form' }
			title={
				isAnchorFmSignup
					? __( 'Create your podcast site with WordPress.com' )
					: __( 'Save your progress' )
			}
			onRequestClose={ closeModal }
			focusOnMount={ false }
			isDismissible={ false }
			overlayClassName={ 'signup-form__overlay' }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<SignupFormHeader onRequestClose={ closeModal } />

			<div className="signup-form__body">
				<h1 className="signup-form__title">
					{ isAnchorFmSignup
						? __( 'Create your podcast site with WordPress.com' )
						: __( 'Save your progress' ) }
				</h1>

				<form onSubmit={ handleSignUp }>
					<fieldset className="signup-form__fieldset">
						<legend className="signup-form__legend">
							<p>
								{ isAnchorFmSignup
									? __( 'Create a WordPress.com account and start creating your free site.' )
									: __( 'Enter an email and password to save your progress and continue.' ) }
							</p>
						</legend>

						<TextControl
							value={ emailVal }
							disabled={ isFetchingNewUser }
							type="email"
							onChange={ setEmailVal }
							placeholder={ __( 'Email address' ) }
							required
							autoFocus={ ! isMobile } // eslint-disable-line jsx-a11y/no-autofocus
						/>

						<TextControl
							value={ passwordVal }
							disabled={ isFetchingNewUser }
							type="password"
							autoComplete="new-password"
							onChange={ setPasswordVal }
							placeholder={ __( 'Password' ) }
							required
						/>

						{ errorMessage && (
							<Notice className="signup-form__error-notice" status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						) }

						<div className="signup-form__footer">
							<p className="signup-form__login-link">
								<span>{ __( 'Already have an account?' ) }</span>{ ' ' }
								<Button className="signup-form__link" isLink href={ loginUrl }>
									{ __( 'Log in' ) }
								</Button>
							</p>

							<p className="signup-form__link signup-form__terms-of-service-link">{ tos }</p>

							<ModalSubmitButton disabled={ isFetchingNewUser } isBusy={ isFetchingNewUser }>
								{ __( 'Create account' ) }
							</ModalSubmitButton>

							<p className="signup-form__link signup-form__terms-of-service-link signup-form__recaptcha_tos">
								{ recaptcha_tos }
							</p>
						</div>
					</fieldset>
				</form>
			</div>

			<div id="g-recaptcha"></div>
		</Modal>
	);
};

export default SignupForm;
