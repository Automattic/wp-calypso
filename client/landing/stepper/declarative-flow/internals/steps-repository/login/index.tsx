/* eslint-disable wpcalypso/jsx-classname-namespace */
import config from '@automattic/calypso-config';
import { Button, FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { TextControl, ExternalLink } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { useAnchorFmParams } from 'calypso/landing/stepper/hooks/use-anchor-fm-params';
import useDetectMatchingAnchorSite from 'calypso/landing/stepper/hooks/use-detect-matching-anchor-site';
import { useIsAnchorFm } from 'calypso/landing/stepper/hooks/use-is-anchor-fm';
import { ONBOARD_STORE, USER_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	recordOnboardingError,
	initGoogleRecaptcha,
	recordGoogleRecaptchaAction,
} from 'calypso/landing/stepper/utils/analytics';
import { useLangRouteParam } from 'calypso/landing/stepper/utils/path';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { UserSelect } from '@automattic/data-stores';
import type { FormEvent } from 'react';
import './style.scss';

const LoginStep: Step = function LoginStep( { navigation } ) {
	const { submit, goToStep } = navigation;
	const { __ } = useI18n();
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const userIsLoggedIn = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
		[]
	);
	//Check to see if there is a site with a matching anchor podcast ID
	const isLookingUpMatchingAnchorSites = useDetectMatchingAnchorSite();
	const { setSiteSetupError } = useDispatch( SITE_STORE );
	const { setAnchorPodcastId, setAnchorEpisodeId, setAnchorSpotifyUrl } =
		useDispatch( ONBOARD_STORE );
	const { isAnchorFmPodcastIdError } = useAnchorFmParams();
	const [ recaptchaClientId, setRecaptchaClientId ] = useState< number >();
	const { createAccount } = useDispatch( USER_STORE );
	const isFetchingNewUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).isFetchingNewUser(),
		[]
	);
	const newUserError = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getNewUserError(),
		[]
	);
	const lang = useLangRouteParam();
	const isMobile = useViewportMatch( 'small', '<' );
	const { anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl } = useAnchorFmParams();
	const isAnchorFmSignup = useIsAnchorFm();
	const [ emailVal, setEmailVal ] = useState( '' );
	const [ passwordVal, setPasswordVal ] = useState( '' );

	const submitAnchorDeps = () => {
		const providedDependencies = {
			anchorFmPodcastId,
			anchorFmEpisodeId,
			anchorFmSpotifyUrl,
		};

		setAnchorPodcastId( ! isAnchorFmPodcastIdError ? anchorFmPodcastId : null );
		setAnchorEpisodeId( anchorFmEpisodeId );
		setAnchorSpotifyUrl( anchorFmSpotifyUrl );
		submit?.( providedDependencies );
	};

	const handleSubmit = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

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
			locale: lang,
			extra: { username_hint: null, is_anchor_fm_signup: isAnchorFmSignup },
			is_passwordless: false,
		} );

		if ( result.ok ) {
			submitAnchorDeps();
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

	let loginRedirectUrl = window.location.origin + '/setup';
	loginRedirectUrl += `/login?new`;
	loginRedirectUrl = addAnchorQueryParts( loginRedirectUrl );
	loginRedirectUrl = encodeURIComponent( loginRedirectUrl );

	let signupUrl = `/setup/login?signup`;
	signupUrl = addAnchorQueryParts( signupUrl );
	signupUrl = encodeURIComponent( signupUrl );

	const loginUrl = `/log-in/new${ langFragment }?redirect_to=${ loginRedirectUrl }&signup_url=${ signupUrl }`;

	const form = (
		<form className="login__form" onSubmit={ handleSubmit }>
			<FormFieldset className="login__fieldset">
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
					<FormInputValidation className="login__error-notice" isError text={ errorMessage } />
				) }

				<div className="login__footer">
					<p className="login__login-link">
						<span>{ __( 'Already have an account?' ) }</span>{ ' ' }
						<Button className="login__link" plain href={ loginUrl }>
							{ __( 'Log in' ) }
						</Button>
					</p>

					<p className="login__link login__terms-of-service-link">{ tos }</p>

					<Button
						type="submit"
						className="login__submit-button"
						primary
						disabled={ isFetchingNewUser }
					>
						{ __( 'Create account' ) }
					</Button>

					<p className="login__link login__terms-of-service-link login__recaptcha_tos">
						{ recaptcha_tos }
					</p>
				</div>
			</FormFieldset>
		</form>
	);
	const stepContent = (
		<div>
			<div className="login__anchor-body">
				<h1 className="login__title">{ __( 'Create your podcast site with WordPress.com' ) }</h1>
				<div className="login__anchor-subheading">
					<p>{ __( 'Create a WordPress.com account and start creating your free site.' ) }</p>
				</div>

				<div className="login__anchor-row">
					{ /* Left Column: Contains Form */ }
					<div className="login__anchor-col">
						<div className="login__anchor-col-container is-left-col">{ form }</div>
					</div>

					<div className="login__anchor-separator" aria-hidden="true" role="presentation" />

					{ /* Right Column: Contains Marketing Text */ }
					<div className="login__anchor-col">
						<div className="login__anchor-col-container is-right-col">
							<div className="login__anchor-col-right-group">
								<div className="login__anchor-right-heading">
									{ __(
										'Turn your listeners into customers with the marketing power of a website'
									) }
								</div>
								<div>
									<ul className="login__anchor-list">
										<li> { __( 'Create forms and mailing lists' ) } </li>
										<li> { __( 'Accept Payments and sell merchandise' ) } </li>
										<li> { __( 'Built-in SEO and social tools' ) } </li>
									</ul>
								</div>
							</div>

							<div className="login__anchor-col-right-group">
								<div className="login__anchor-right-heading">
									{ __( 'Increase your audience with episode transcriptions' ) }
								</div>
								<div>
									<ul className="login__anchor-list">
										<li> { __( 'Add transcriptions to episode pages' ) } </li>
										<li> { __( 'Customizable templates built for podcasts' ) } </li>
										<li> { __( 'Add images, videos, and text formatting' ) } </li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div id="g-recaptcha"></div>
		</div>
	);

	/*
	 * If we have a current user and they're logged in,
	 * proceed to the next step; no need to log in.
	 */
	useEffect( () => {
		if ( currentUser && userIsLoggedIn ) {
			submitAnchorDeps();
		}
	}, [ currentUser, userIsLoggedIn ] );

	useEffect( () => {
		if ( isAnchorFmPodcastIdError ) {
			const error = __( "We're sorry!" );
			const message = __(
				"We're unable to locate your podcast. Return to Anchor or continue with site creation."
			);
			setSiteSetupError( error, message );
			return goToStep?.( 'error' );
		}
	}, [ isAnchorFmPodcastIdError ] );

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

	//If we're still checking for matching Anchor sites, don't show the form
	if ( isLookingUpMatchingAnchorSites ) {
		return <div />;
	}

	return (
		<StepContainer
			stepName="login-step"
			hideBack
			hideSkip
			hideNext
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LoginStep;
