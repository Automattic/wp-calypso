import config from '@automattic/calypso-config';
import cookie from 'cookie';
import { get, includes, startsWith } from 'lodash';
import {
	isAkismetOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravatarOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
	isIntenseDebateOAuth2Client,
} from 'calypso/lib/oauth2-clients';

export function getSocialServiceFromClientId( clientId ) {
	if ( ! clientId ) {
		return null;
	}

	if ( clientId === config( 'google_oauth_client_id' ) ) {
		return 'google';
	}

	if ( clientId === config( 'facebook_app_id' ) ) {
		return 'facebook';
	}

	if ( clientId === config( 'apple_oauth_client_id' ) ) {
		return 'apple';
	}

	return null;
}

/**
 * Adds/ensures a leading slash to any string intended to be used as an absolute path.
 *
 * @param path The path to encode with a leading slash.
 */
export function pathWithLeadingSlash( path ) {
	// Note: Check for string type to ensure sanity. Technically the type here may be `unknown`.
	if ( 'string' !== typeof path ) {
		return '';
	}

	return path ? `/${ path.replace( /^\/+/, '' ) }` : '';
}

export function getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname ) {
	let signupUrl = config( 'signup_url' );

	const redirectTo = get( currentQuery, 'redirect_to', '' );
	const signupFlow = get( currentQuery, 'signup_flow' );
	const wccomFrom = get( currentQuery, 'wccom-from' );

	if (
		// Match locales like `/log-in/jetpack/es`
		startsWith( currentRoute, '/log-in/jetpack' )
	) {
		// Basic validation that we're in a valid Jetpack Authorization flow
		if (
			includes( get( currentQuery, 'redirect_to' ), '/jetpack/connect/authorize' ) &&
			includes( get( currentQuery, 'redirect_to' ), '_wp_nonce' )
		) {
			/**
			 * `log-in/jetpack/:locale` is reached as part of the Jetpack connection flow. In
			 * this case, the redirect_to will handle signups as part of the flow. Use the
			 * `redirect_to` parameter directly for signup.
			 */
			signupUrl = currentQuery.redirect_to;
		} else {
			signupUrl = '/jetpack/connect';
		}
	} else if ( '/jetpack-connect' === pathname ) {
		signupUrl = '/jetpack/connect';
	} else if ( signupFlow ) {
		signupUrl += '/' + signupFlow;
	}

	if (
		isAkismetOAuth2Client( oauth2Client ) ||
		isGravatarOAuth2Client( oauth2Client ) ||
		isIntenseDebateOAuth2Client( oauth2Client )
	) {
		const oauth2Flow = 'wpcc';
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		signupUrl = `${ signupUrl }/${ oauth2Flow }?${ oauth2Params.toString() }`;
	}

	if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		const oauth2Flow = 'crowdsignal';
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		signupUrl = `${ signupUrl }/${ oauth2Flow }?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client && isWooOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		if ( wccomFrom ) {
			oauth2Params.set( 'wccom-from', wccomFrom );
		}
		signupUrl = `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client && isJetpackCloudOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		signupUrl = `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
	}

	if ( includes( redirectTo, 'action=jetpack-sso' ) && includes( redirectTo, 'sso_nonce=' ) ) {
		const params = new URLSearchParams( {
			redirect_to: redirectTo,
		} );
		signupUrl = `/start/account?${ params.toString() }`;
	}

	return signupUrl;
}

export const isReactLostPasswordScreenEnabled = () => {
	const cookies = typeof document === 'undefined' ? {} : cookie.parse( document.cookie );
	return (
		config.isEnabled( 'login/react-lost-password-screen' ) ||
		cookies.enable_react_password_screen === 'yes'
	);
};
