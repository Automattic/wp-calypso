import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import page from 'page';
import { SOCIAL_HANDOFF_CONNECT_ACCOUNT } from 'calypso/state/action-types';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
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
	const isWhiteLogin =
		! isJetpackLogin &&
		! isP2Login &&
		Boolean( query?.client_id ) === false &&
		Boolean( query?.oauth2_client_id ) === false;

	context.primary = (
		<WPLogin
			action={ action }
			isJetpack={ isJetpackLogin }
			isWhiteLogin={ isWhiteLogin }
			isP2Login={ isP2Login }
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

		if ( client_id !== redirectParams.get( 'client_id' ) ) {
			const error = new Error(
				'The `redirect_to` query parameter is invalid with the given `client_id`.'
			);
			error.status = 401;
			return next( error );
		}

		try {
			await context.store.dispatch( fetchOAuth2ClientData( client_id ) );
		} catch ( error ) {
			return next( error );
		}
	}

	enhanceContextWithLogin( context );

	next();
}

export function magicLogin( context, next ) {
	const { path } = context;

	context.primary = <MagicLogin path={ path } />;

	next();
}

export function qrCodeLogin( context, next ) {
	const { redirect_to } = context.query;
	context.primary = <QrCodeLoginPage locale={ context.params.lang } redirectTo={ redirect_to } />;

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

	const { client_id, email, redirect_to, token } = previousQuery;

	const flow = redirect_to?.includes( 'jetpack/connect' ) ? 'jetpack' : null;

	const PrimaryComponent = getHandleEmailedLinkFormComponent( flow );

	context.primary = (
		<PrimaryComponent clientId={ client_id } emailAddress={ email } token={ token } />
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
	const isUserComingFromMigrationPlugin = redirect_to?.includes( 'jetpack-migration' );

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
