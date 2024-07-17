import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import GithubSocialButton from 'calypso/components/social-buttons/github';
import GoogleSocialButton from 'calypso/components/social-buttons/google';
import GoogleOneTapButton from 'calypso/components/social-buttons/google-one-tap';
import { preventWidows } from 'calypso/lib/formatting';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { isWpccFlow } from 'calypso/signup/is-flow';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import SocialToS from './social-tos';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

const GoogleButton = config.isEnabled( 'google_one_tap' ) ? GoogleOneTapButton : GoogleSocialButton;

interface SocialAuthenticationFormProps {
	compact?: boolean;
	handleGoogleResponse: ( response: any ) => void;
	handleAppleResponse: ( response: any ) => void;
	handleGitHubResponse: ( response: any ) => void;
	getRedirectUri: ( service: string ) => string;
	trackLoginAndRememberRedirect: ( service: string ) => void;
	socialService: string;
	socialServiceResponse: string;
	children: JSX.Element;
	disableTosText?: boolean;
	flowName: string;
	isSocialFirst?: boolean;
	isLogin?: boolean;
}

const SocialAuthenticationForm = ( {
	compact,
	handleGoogleResponse,
	handleGitHubResponse,
	handleAppleResponse,
	getRedirectUri,
	trackLoginAndRememberRedirect,
	socialService,
	socialServiceResponse,
	children,
	disableTosText,
	flowName,
	isSocialFirst,
	isLogin,
}: SocialAuthenticationFormProps ) => {
	const translate = useTranslate();

	const currentRoute = useSelector( getCurrentRoute );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWoo = useSelector(
		( state: IAppState ) =>
			isWooOAuth2Client( oauth2Client ) || isWooCommerceCoreProfilerFlow( state )
	);

	const shouldUseRedirectFlow = () => {
		// If calypso is loaded in a popup, we don't want to open a second popup for social signup or login
		// let's use the redirect flow instead in that case
		let isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

		// Jetpack Connect-in-place auth flow contains special reserved args, so we want a popup for social signup and login.
		// See p1HpG7-7nj-p2 for more information.
		if ( isPopup && [ '/jetpack/connect/authorize', '/log-in/jetpack' ].includes( currentRoute ) ) {
			isPopup = false;
		}

		// disable for oauth2 flows for now
		return ! oauth2Client && isPopup;
	};

	const uxMode = shouldUseRedirectFlow() ? 'redirect' : 'popup';
	const uxModeApple = config.isEnabled( 'sign-in-with-apple/redirect' ) ? 'redirect' : uxMode;

	// Note: we allow social sign-in on the Desktop app, but not social sign-up. Existing config flags do
	// not distinguish between sign-in and sign-up but instead use the catch-all `signup/social` flag.
	// Therefore we need to make an exception for the desktop app directly in this component because there
	// are many places in which the social signup form is rendered based only on the presence of the
	// `signup/social` config flag.
	const isSignupOnDesktop = config.isEnabled( 'desktop' ) && ! isLogin;

	return (
		! isSignupOnDesktop && (
			<Card
				className={ clsx( 'auth-form__social', isLogin ? 'is-login' : 'is-signup', {
					'is-social-first': isSocialFirst,
				} ) }
			>
				{ ! compact && (
					<p className="auth-form__social-text">
						{ preventWidows( translate( 'Or create an account using:' ) ) }
					</p>
				) }

				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						<GoogleButton
							clientId={ config( 'google_oauth_client_id' ) }
							responseHandler={ handleGoogleResponse }
							uxMode={ uxMode }
							redirectUri={ getRedirectUri( 'google' ) }
							onClick={ () => {
								trackLoginAndRememberRedirect( 'google' );
							} }
							socialServiceResponse={ socialService === 'google' ? socialServiceResponse : null }
							startingPoint={ isLogin ? 'login' : 'signup' }
						/>

						<AppleLoginButton
							clientId={ config( 'apple_oauth_client_id' ) }
							responseHandler={ handleAppleResponse }
							uxMode={ uxModeApple }
							redirectUri={ getRedirectUri( 'apple' ) }
							onClick={ () => {
								trackLoginAndRememberRedirect( 'apple' );
							} }
							socialServiceResponse={ socialService === 'apple' ? socialServiceResponse : null }
							originalUrlPath={
								// Since the signup form is only ever called from the user step, currently, we can rely on window.location.pathname
								// to return back to the user step, which then allows us to continue on with the flow once the submitSignupStep action is called within the user step.
								isLogin ? null : window?.location?.pathname
							}
							// If we are on signup, attach the query string to the state so we can pass it back to the server to show the correct UI.
							// We need this because Apple doesn't allow to have dynamic parameters in redirect_uri.
							queryString={
								isWpccFlow( flowName ) && ! isLogin ? window?.location?.search?.slice( 1 ) : ''
							}
						/>

						<GithubSocialButton
							socialServiceResponse={ socialService === 'github' ? socialServiceResponse : null }
							redirectUri={ getRedirectUri( 'github' ) }
							responseHandler={ handleGitHubResponse }
							onClick={ () => {
								trackLoginAndRememberRedirect( 'github' );
							} }
						/>

						{ children }
					</div>
					{ ! isWoo && ! disableTosText && <SocialToS /> }
				</div>
				{ isWoo && ! disableTosText && <SocialToS /> }
			</Card>
		)
	);
};

export default SocialAuthenticationForm;
