import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { loadScript } from '@automattic/load-script';
import wpcomRequest from 'wpcom-proxy-request';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import {
	isGravPoweredOAuth2Client,
	isWooOAuth2Client,
	isPartnerPortalOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login as loginPath } from 'calypso/lib/paths';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import { DesktopLoginStart, DesktopLoginFinalize } from 'calypso/login/desktop-login';
import { SOCIAL_HANDOFF_CONNECT_ACCOUNT } from 'calypso/state/action-types';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { loginSocialUser, rebootAfterLogin } from 'calypso/state/login/actions';
import { postLoginRequest } from 'calypso/state/login/utils';
import { logoutUser } from 'calypso/state/logout/actions';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
import { getOAuth2Client } from 'calypso/state/oauth2-clients/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { setRoute } from 'calypso/state/route/actions';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import MagicLogin from './magic-login';
import HandleEmailedLinkForm from './magic-login/handle-emailed-link-form';
import HandleEmailedLinkFormJetpackConnect from './magic-login/handle-emailed-link-form-jetpack-connect';
import QrCodeLoginPage from './qr-code-login-page';
import WPLogin from './wp-login';

const enhanceContextWithLogin = ( context ) => {
	const {
		params: { flow, isJetpack, socialService, twoFactorAuthType, action },
		path,
		query,
		isServerSide,
	} = context;

	// Process a social login handoff from /start/user.
	if ( query?.email_address && query?.service && query?.access_token && query?.id_token ) {
		context.store.dispatch( {
			type: SOCIAL_HANDOFF_CONNECT_ACCOUNT,
			email: query.email_address,
			authInfo: {
				service: query.service,
				access_token: query.access_token,
				id_token: query.id_token,
			},
		} );

		// Remove state-related data from URL but leave 'email_address'.
		if ( ! isServerSide ) {
			const params = new URLSearchParams( new URL( window.location.href ).search );
			params.delete( 'service' );
			params.delete( 'access_token' );
			params.delete( 'id_token' );
			page.redirect( window.location.pathname + '?' + params.toString() );
		}
	}

	const previousHash = context.state || {};
	const { client_id, user_email, user_name, id_token, state } = previousHash;
	const socialServiceResponse = client_id
		? { client_id, user_email, user_name, id_token, state }
		: null;
	const isJetpackLogin = isJetpack === 'jetpack';
	const isP2Login = query && query.from === 'p2';
	const clientId = query?.client_id;
	const oauth2ClientId = query?.oauth2_client_id;
	const oauth2Client =
		getOAuth2Client( context.store.getState(), Number( clientId || oauth2ClientId ) ) || {};
	const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );
	const isPartnerPortalClient = isPartnerPortalOAuth2Client( oauth2Client );

	const isWhiteLogin =
		( ! isJetpackLogin &&
			! isP2Login &&
			Boolean( clientId ) === false &&
			Boolean( oauth2ClientId ) === false ) ||
		isGravPoweredClient ||
		isPartnerPortalClient;

	context.primary = (
		<WPLogin
			action={ action }
			isJetpack={ isJetpackLogin }
			isWhiteLogin={ isWhiteLogin }
			isP2Login={ isP2Login }
			isGravPoweredClient={ isGravPoweredClient }
			path={ path }
			twoFactorAuthType={ twoFactorAuthType }
			socialService={ socialService }
			socialServiceResponse={ socialServiceResponse }
			socialConnect={ flow === 'social-connect' }
			privateSite={ flow === 'private-site' }
			domain={ ( query && query.domain ) || null }
			fromSite={ ( query && query.site ) || null }
			signupUrl={ ( query && query.signup_url ) || null }
		/>
	);
};

export async function login( context, next ) {
	const {
		query: { client_id, redirect_to },
	} = context;

	// Remove id_token from the address bar and push social connect args into the state instead
	if ( context.hash && context.hash.client_id ) {
		page.replace( context.path, context.hash );

		return;
	}

	if ( client_id ) {
		if ( ! redirect_to ) {
			const error = new Error( 'The `redirect_to` query parameter is missing.' );
			error.status = 401;
			return next( error );
		}

		const { searchParams: redirectParams } = getUrlParts( redirect_to );
		const back = redirectParams.get( 'back' );

		const redirectClientId =
			redirectParams.get( 'client_id' ) ||
			// If the client_id is not in the redirect_to URL, check the back URL. This is for the case where the client_id is passed in the back parameter of remote login link when proxy is enabled. See: https://github.com/Automattic/wp-calypso/issues/52940
			( back ? getUrlParts( back ).searchParams.get( 'client_id' ) : null );

		if ( client_id !== redirectClientId ) {
			const error = new Error(
				'The `redirect_to` query parameter is invalid with the given `client_id`.'
			);
			error.status = 401;
			return next( error );
		}

		const OAuth2Client = getOAuth2Client( context.store.getState(), client_id );
		if ( ! OAuth2Client ) {
			// Only fetch the OAuth2 client data if it's not already in the store. This is to avoid unnecessary requests and re-renders.
			try {
				await context.store.dispatch( fetchOAuth2ClientData( client_id ) );
			} catch ( error ) {
				return next( error );
			}
		}
	}

	enhanceContextWithLogin( context );

	next();
}

export function desktopLogin( context, next ) {
	context.primary = <DesktopLoginStart />;
	next();
}

export function desktopLoginFinalize( context, next ) {
	const { hash } = context;
	context.primary = (
		<DesktopLoginFinalize error={ hash?.error } accessToken={ hash?.access_token } />
	);
	next();
}

export async function magicLogin( context, next ) {
	const {
		path,
		query: { gravatar_flow, client_id, redirect_to, auto_trigger },
	} = context;

	if ( isUserLoggedIn( context.store.getState() ) && auto_trigger === undefined ) {
		return login( context, next );
	}

	// For Gravatar-related OAuth2 clients, check the necessary URL parameters and fetch the client data if needed.
	if ( gravatar_flow ) {
		if ( ! client_id ) {
			const error = new Error( 'The `client_id` query parameter is missing.' );
			error.status = 401;
			return next( error );
		}

		if ( ! redirect_to ) {
			const error = new Error( 'The `redirect_to` query parameter is missing.' );
			error.status = 401;
			return next( error );
		}

		const oauth2Client = getOAuth2Client( context.store.getState(), client_id );
		// Only fetch the data if it's not already in the store. This is to avoid unnecessary requests and re-renders.
		if ( ! oauth2Client ) {
			try {
				await context.store.dispatch( fetchOAuth2ClientData( client_id ) );
			} catch ( error ) {
				return next( error );
			}
		}
	}

	context.primary = <MagicLogin path={ path } />;

	next();
}

export function qrCodeLogin( context, next ) {
	const { redirect_to } = context.query;
	context.primary = <QrCodeLoginPage locale={ context.params.lang } redirectTo={ redirect_to } />;

	next();
}

export async function jetpackGoogleAuth( context, next ) {
	const { query, isServerSide } = context;

	// Don't run authentication if it's server side
	if ( isServerSide ) {
		return next();
	}

	const redirectUri = `https://${ window.location.host }${ loginPath( {
		socialService: 'google',
	} ) }`;

	try {
		// Get authorization nonce for security
		const response = await wpcomRequest( {
			path: '/generate-authorization-nonce',
			apiNamespace: 'wpcom/v2',
			method: 'GET',
		} );
		const nonce = response.nonce;

		// Create state object with relevant data
		const stateObject = {
			redirect_to: query?.redirect_to || '/',
			is_jetpack: true,
			locale: context.params.lang,
			wpcomNonce: nonce,
			queryParams: { ...query },
		};

		// Store nonce in sessionStorage for validation on callback
		window.sessionStorage.setItem( 'google_oauth_nonce', nonce );

		// Load Google Identity Services API if not already loaded
		if ( ! window?.google?.accounts?.oauth2 ) {
			await loadScript( 'https://accounts.google.com/gsi/client' );
			if ( ! window?.google?.accounts?.oauth2 ) {
				throw new Error( 'Failed to load Google Identity Services API' );
			}
		}

		if ( isUserLoggedIn( context.store.getState() ) ) {
			await context.store.dispatch( logoutUser() );
		}

		// Initialize and request authorization code
		window.google.accounts.oauth2
			.initCodeClient( {
				client_id: config( 'google_oauth_client_id' ),
				scope: 'openid profile email',
				ux_mode: 'redirect',
				redirect_uri: redirectUri,
				state: JSON.stringify( stateObject ),
				callback: () => {},
			} )
			.requestCode();
		return;
	} catch {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: 'Error initiating Google login. Please try again.',
			},
		} );
		return redirectJetpackDirectAuthError( context, next );
	}
}

export async function jetpackGoogleAuthCallback( context, next ) {
	const { query, isServerSide } = context;

	const code = query.code;
	const stateString = query.state;
	const error = query.error;

	// Not a redirect from Google if no code or error present, or if it's server side
	if ( ( ! code && ! error ) || isServerSide ) {
		return next();
	}

	let state;

	try {
		const stateData = JSON.parse( stateString || '{}' );

		state = {
			redirect_to: stateData.redirect_to || '/',
			is_jetpack: stateData.is_jetpack || true,
			locale: stateData.locale || getLocaleSlug(),
			wpcomNonce: stateData.wpcomNonce || '',
			queryParams: stateData.queryParams || {},
		};
	} catch {
		state = {}; // Fallback to empty state if JSON parsing fails
	}

	// Handle error from Google
	if ( error ) {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: `Error during Google authentication: ${ error }`,
			},
		} );
		return redirectJetpackDirectAuthError( context, next, {
			code: null,
			redirect_to: state.redirect_to,
		} );
	}

	try {
		const storedNonce = window.sessionStorage.getItem( 'google_oauth_nonce' );
		window.sessionStorage.removeItem( 'google_oauth_nonce' );

		if ( ! storedNonce || ! stateString ) {
			throw new Error( 'Missing state parameter' );
		}

		if ( state.wpcomNonce !== storedNonce ) {
			throw new Error( 'Invalid state parameter' );
		}

		const redirectUri = `https://${ window.location.host }${ loginPath( {
			socialService: 'google',
		} ) }`;

		// Exchange auth code for tokens
		const response = await postLoginRequest( 'exchange-social-auth-code', {
			service: 'google',
			auth_code: code,
			redirect_uri: redirectUri,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			state: state.wpcomNonce, // State is nonce in this request
		} );

		const { access_token, id_token } = response.body.data;

		// Try to create a new WordPress.com account (if it doesn't exist) - then, log in the user
		try {
			await wpcom.req.post( '/users/social/new', {
				service: 'google',
				access_token,
				id_token,
				signup_flow_name: 'google-auth-signup',
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				tos: JSON.stringify( getToSAcceptancePayload() ),
			} );

			await context.store.dispatch(
				loginSocialUser(
					{
						service: 'google',
						access_token,
						id_token,
					},
					state.redirect_to
				)
			);
			const url = new URL( state.redirect_to );
			context.store.dispatch(
				setRoute( url.pathname, Object.fromEntries( url.searchParams.entries() ) )
			);

			await context.store.dispatch( rebootAfterLogin() );
			return page.redirect( state.redirect_to );
		} catch ( createError ) {
			// If both connection and creation fail, show warning and redirect
			context.store.dispatch( {
				type: 'NOTICE_CREATE',
				notice: {
					status: 'is-warning',
					text: 'Could not complete Google login. Please try again.',
				},
			} );

			return redirectJetpackDirectAuthError( context, next, {
				code: null,
				redirect_to: state.redirect_to,
			} );
		}
	} catch {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: 'Error during Google authentication. Please try again.',
			},
		} );

		return redirectJetpackDirectAuthError( context, next, {
			code: null,
			redirect_to: state.redirect_to,
		} );
	}
}

export async function jetpackAppleAuth( context, next ) {
	const { query, isServerSide } = context;

	// Don't run authentication if it's server side
	if ( isServerSide ) {
		return next();
	}

	const redirectUri = `https://${ window.location.host }${ loginPath( {
		socialService: 'apple',
	} ) }`;

	try {
		// Get authorization nonce for security
		const response = await wpcomRequest( {
			path: '/generate-authorization-nonce',
			apiNamespace: 'wpcom/v2',
			method: 'GET',
		} );
		const nonce = response.nonce;

		// Create state object with relevant data
		const stateObject = {
			is_jetpack: true,
			oauth2State: nonce,
			// Allow just redirect_to to be passed in the query params
			queryString: `redirect_to=${ query?.redirect_to || '/' }`,
		};

		// Store nonce in sessionStorage for validation on callback
		window.sessionStorage.setItem( 'siwa_state', nonce );

		// Load Apple client if not already loaded
		const appleClientUrl =
			'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

		if ( ! window.AppleID ) {
			await loadScript( appleClientUrl );
			if ( ! window.AppleID ) {
				throw new Error( 'Failed to load Apple Authentication Services API' );
			}
		}

		if ( isUserLoggedIn( context.store.getState() ) ) {
			await context.store.dispatch( logoutUser() );
		}

		// Initialize Apple auth
		window.AppleID.auth.init( {
			clientId: config( 'apple_oauth_client_id' ),
			scope: 'name email',
			redirectURI: redirectUri,
			state: JSON.stringify( stateObject ),
		} );

		// Trigger the sign-in
		window.AppleID.auth.signIn();
		return;
	} catch {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: 'Error initiating Apple login. Please try again.',
			},
		} );

		return redirectJetpackDirectAuthError( context, next );
	}
}

export async function jetpackAppleAuthCallback( context, next ) {
	const { redirect_to } = context.query;

	// Remove id_token from the address bar and push social connect args into the state instead (let's follow original flow; see login())
	if ( context.hash && context.hash.client_id ) {
		page.replace( context.path, context.hash );

		return;
	}

	const previousHash = context.state || {};
	const { user_email, user_name, id_token, state } = previousHash;

	// Not a redirect from Apple if no token or error present
	if ( ! id_token ) {
		return next();
	}

	try {
		const storedNonce = window.sessionStorage.getItem( 'siwa_state' );
		window.sessionStorage.removeItem( 'siwa_state' );

		if ( ! storedNonce || ! state ) {
			throw new Error( 'Missing state parameter' );
		}

		if ( state !== storedNonce ) {
			throw new Error();
		}

		try {
			// The account is created by the server side endpoint - we just need to log in the user
			await context.store.dispatch(
				loginSocialUser(
					{
						service: 'apple',
						id_token,
						user_name,
						user_email,
					},
					redirect_to
				)
			);
			const url = new URL( redirect_to );
			context.store.dispatch(
				setRoute( url.pathname, Object.fromEntries( url.searchParams.entries() ) )
			);

			await context.store.dispatch( rebootAfterLogin() );
			return page.redirect( redirect_to );
		} catch ( createError ) {
			// If both connection and creation fail, show warning and redirect
			context.store.dispatch( {
				type: 'NOTICE_CREATE',
				notice: {
					status: 'is-warning',
					text: 'Could not complete Apple login. Falling back to standard flow.',
				},
			} );

			return redirectJetpackDirectAuthError( context, next );
		}
	} catch {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: 'Error during Apple authentication. Please try again.',
			},
		} );

		return redirectJetpackDirectAuthError( context, next );
	}
}

export async function jetpackGitHubAuth( context, next ) {
	const { query, isServerSide } = context;

	// Don't run authentication if it's server side
	if ( isServerSide ) {
		return next();
	}

	const redirectUri = `https://${ window.location.host }/log-in/jetpack/github/callback`;
	try {
		// Store redirect_to in sessionStorage for use on callback
		window.sessionStorage.setItem( 'github_redirect_to', query?.redirect_to || '/' );

		// Redirect to GitHub authorization URL
		const scope = 'read:user,user:email';
		const params = new URLSearchParams( {
			redirect_uri: redirectUri,
			scope,
			ux_mode: 'redirect',
			redirect_to: query?.redirect_to || '/',
		} );

		if ( isUserLoggedIn( context.store.getState() ) ) {
			await context.store.dispatch( logoutUser() );
		}

		window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize?${ params.toString() }`;
	} catch {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: 'Error during GitHub authentication. Please try again.',
			},
		} );

		return redirectJetpackDirectAuthError( context, next );
	}
}

export async function jetpackGitHubAuthCallback( context, next ) {
	const { query, isServerSide } = context;

	const code = query.code;
	const service = query.service;

	// Not a redirect from GitHub if no code or error present
	if ( ! code || service !== 'github' || isServerSide ) {
		return next();
	}

	const redirect_to = window.sessionStorage.getItem( 'github_redirect_to' ) ?? '/';
	window.sessionStorage.removeItem( 'github_redirect_to' );

	try {
		// GitHub supports localhost auth; and we allowlist the jetpack callback path
		const redirectUri = `${ window.location.origin }/log-in/jetpack/github/callback`;

		// Exchange auth code for tokens
		const response = await postLoginRequest( 'exchange-social-auth-code', {
			service: 'github',
			auth_code: code,
			redirect_uri: redirectUri,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} );

		const { access_token } = response.body.data;

		// Try to create a new WordPress.com account (if it doesn't exist) - then, log in the user
		try {
			try {
				await wpcom.req.post( '/users/social/new', {
					service: 'github',
					access_token,
					signup_flow_name: 'github-auth-signup',
					locale: getLocaleSlug(),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					tos: JSON.stringify( getToSAcceptancePayload() ),
				} );
			} catch {
				// Silently fail; when id_token is not present, the endpoint fails when the user already exists
			}

			await context.store.dispatch(
				loginSocialUser(
					{
						service: 'github',
						access_token,
					},
					redirect_to
				)
			);
			const url = new URL( redirect_to );
			context.store.dispatch(
				setRoute( url.pathname, Object.fromEntries( url.searchParams.entries() ) )
			);

			await context.store.dispatch( rebootAfterLogin() );
			return page.redirect( redirect_to );
		} catch {
			// If both connection and creation fail, show warning and redirect back to login page
			return redirectJetpackDirectAuthError( context, next, { redirect_to } );
		}
	} catch {
		context.store.dispatch( {
			type: 'NOTICE_CREATE',
			notice: {
				status: 'is-error',
				text: 'Error during GitHub authentication. Please try again.',
			},
		} );
		return redirectJetpackDirectAuthError( context, next, { redirect_to } );
	}
}

function getHandleEmailedLinkFormComponent( flow ) {
	if ( flow === 'jetpack' && config.isEnabled( 'jetpack/magic-link-signup' ) ) {
		return HandleEmailedLinkFormJetpackConnect;
	}
	return HandleEmailedLinkForm;
}

export function magicLoginUse( context, next ) {
	/**
	 * Pull the query arguments out of the URL & into the state.
	 * It unclutters the address bar & will keep tokens out of tracking pixels.
	 */
	if ( context.querystring ) {
		page.replace( context.pathname, context.query );

		return;
	}

	const previousQuery = context.state || {};

	const { client_id, email, redirect_to, token, transition: isTransition } = previousQuery;

	let activate = '';
	try {
		const params = new URLSearchParams( new URL( redirect_to ).search );
		activate = params.get( 'activate' );
	} catch ( e ) {
		// redirect_to isn't always given, the URL constructor will throw in this case
	}
	const transition = isTransition === 'true';

	const flow = redirect_to?.includes( 'jetpack/connect' ) ? 'jetpack' : null;

	const PrimaryComponent = getHandleEmailedLinkFormComponent( flow );

	context.primary = (
		<PrimaryComponent
			clientId={ client_id }
			emailAddress={ email }
			token={ token }
			redirectTo={ redirect_to }
			transition={ transition }
			activate={ activate }
		/>
	);

	next();
}

export function redirectDefaultLocale( context, next ) {
	// Do not redirect if it's server side
	if ( context.isServerSide ) {
		return next();
	}
	// Only handle simple routes
	if ( context.pathname !== '/log-in/en' && context.pathname !== '/log-in/jetpack/en' ) {
		if ( ! isUserLoggedIn( context.store.getState() ) && ! context.params.lang ) {
			context.params.lang = config( 'i18n_default_locale_slug' );
		}
		return next();
	}

	// Do not redirect if user bootrapping is disabled
	if (
		! isUserLoggedIn( context.store.getState() ) &&
		! config.isEnabled( 'wpcom-user-bootstrap' )
	) {
		return next();
	}

	// Do not redirect if user is logged in and the locale is different than english
	// so we force the page to display in english
	const currentUserLocale = getCurrentUserLocale( context.store.getState() );
	if ( currentUserLocale && currentUserLocale !== 'en' ) {
		return next();
	}

	if ( context.params.isJetpack === 'jetpack' ) {
		page.redirect( '/log-in/jetpack' );
	} else {
		page.redirect( '/log-in' );
	}
}

export function redirectJetpack( context, next ) {
	const { isJetpack, socialService } = context.params;
	const { redirect_to, state } = context.query;

	const isUserComingFromPricingPage =
		redirect_to?.includes( 'source=jetpack-plans' ) ||
		redirect_to?.includes( 'source=jetpack-connect-plans' );
	const isUserComingFromMigrationPlugin = redirect_to?.includes( 'wpcom-migration' );

	/**
	 * Send arrivals from the jetpack connect process or jetpack's pricing page
	 * (when site user email matches a wpcom account) to the jetpack branded login.
	 *
	 * A direct redirect to /log-in/jetpack is not currently done at jetpack.wordpress.com
	 * because the iOS app relies on seeing a request to /log-in$ to show its
	 * native credentials form.
	 */

	// 2023-01-23: For some reason (yet unknown), the path replacement below
	// is happening twice. Until we determine and fix the root cause, this
	// guard exists to stop it from happening.
	const pathAlreadyUpdated = context.path.includes( 'log-in/jetpack' );
	if ( pathAlreadyUpdated ) {
		next();
		return;
	}

	// If is_jetpack is set in state (from Google Auth callback), redirect to Jetpack login
	if ( socialService === 'google' ) {
		try {
			const stateData = JSON.parse( state );
			if ( stateData.is_jetpack === true ) {
				return context.redirect( context.path.replace( 'log-in', 'log-in/jetpack' ) );
			}
		} catch {
			// Silently fail
		}
	}

	if (
		( isJetpack !== 'jetpack' &&
			redirect_to?.includes( 'jetpack/connect' ) &&
			! isUserComingFromMigrationPlugin ) ||
		isUserComingFromPricingPage
	) {
		return context.redirect( context.path.replace( 'log-in', 'log-in/jetpack' ) );
	}
	next();
}

/**
 * Redirect clients to use PHP lost password. Excludes WooCommerce and Tumblr Blaze Pro.
 * @param {Object} context - The context object containing request parameters and query strings.
 * @param {Function} next - The next middleware function to call if conditions are met.
 * @returns {void} Either redirects the user or invokes the `next()` middleware function.
 */
export function redirectLostPassword( context, next ) {
	const { action } = context.params;

	if ( action !== 'lostpassword' ) {
		next();
		return;
	}

	const state = context.store.getState();
	const oauth2Client = getCurrentOAuth2Client( state );

	const shouldRedirectToLostPassword = () =>
		! getIsBlazePro( state ) && ! isWooOAuth2Client( oauth2Client ) && ! isWooJPCFlow( state );

	if ( shouldRedirectToLostPassword() ) {
		return context.redirect( 301, '/wp-login.php?action=lostpassword' );
	}

	next();
}

export function redirectJetpackDirectAuthError( context, next, newQuery = {} ) {
	const queryString = new URLSearchParams(
		Object.assign( {}, context.query, newQuery )
	).toString();
	const redirectUrl = queryString ? `/log-in/jetpack/?${ queryString }` : '/log-in/jetpack/';
	window.history.replaceState( null, '', redirectUrl );
	return next();
}
