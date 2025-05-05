import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import {
	isGravPoweredOAuth2Client,
	isWooOAuth2Client,
	isPartnerPortalOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { DesktopLoginStart, DesktopLoginFinalize } from 'calypso/login/desktop-login';
import { SOCIAL_HANDOFF_CONNECT_ACCOUNT } from 'calypso/state/action-types';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
import { getOAuth2Client } from 'calypso/state/oauth2-clients/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
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
	const clientId = query?.client_id;
	const oauth2ClientId = query?.oauth2_client_id;
	const oauth2Client =
		getOAuth2Client( context.store.getState(), Number( clientId || oauth2ClientId ) ) || {};
	const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );
	const isPartnerPortalClient = isPartnerPortalOAuth2Client( oauth2Client );

	const isWhiteLogin =
		( ! isJetpackLogin && Boolean( clientId ) === false && Boolean( oauth2ClientId ) === false ) ||
		isGravPoweredClient ||
		isPartnerPortalClient;

	context.primary = (
		<WPLogin
			action={ action }
			isJetpack={ isJetpackLogin }
			isWhiteLogin={ isWhiteLogin }
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
		query: { gravatar_flow, client_id, redirect_to },
	} = context;

	if ( isUserLoggedIn( context.store.getState() ) ) {
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

	// Check if this is a Jetpack login flow based on the URL path
	const isJetpack = context.path.includes( '/jetpack' );

	context.primary = (
		<QrCodeLoginPage
			locale={ context.params.lang }
			redirectTo={ redirect_to }
			isJetpack={ isJetpack }
		/>
	);

	next();
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
	const { isJetpack } = context.params;
	const { redirect_to } = context.query;

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
