import config from '@automattic/calypso-config';
import cookie from 'cookie';
import { get, includes, startsWith } from 'lodash';
import {
	isAkismetOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravPoweredOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
	isIntenseDebateOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';

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
	const signupUrl = config( 'signup_url' );

	const redirectTo = get( currentQuery, 'redirect_to', '' );
	const signupFlow = get( currentQuery, 'signup_flow' );
	const wccomFrom = get( currentQuery, 'wccom-from' );
	const isFromMigrationPlugin = includes( redirectTo, 'wpcom-migration' );

	/**
	 *  Include redirects to public.api/connect/?action=verify&service={some service}
	 *  If the signup is from the Highlander Comments flow, the signup page will be in a popup modal
	 *  We need to redirect back to public.api/connect/ to do an external login and close modal
	 *  Ref: PCYsg-Hfw-p2
	 */
	const isFromPublicAPIConnectFlow = includes( redirectTo, 'public.api/connect/?action=verify' );

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
			return currentQuery.redirect_to;
		}
		return '/jetpack/connect';
	} else if ( '/jetpack-connect' === pathname ) {
		return '/jetpack/connect';
	}

	if ( isAkismetOAuth2Client( oauth2Client ) || isIntenseDebateOAuth2Client( oauth2Client ) ) {
		const oauth2Flow = 'wpcc';
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		return `${ signupUrl }/${ oauth2Flow }?${ oauth2Params.toString() }`;
	}

	if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
		// Gravatar powered clients signup via the magic login page
		return login( {
			locale,
			twoFactorAuthType: 'link',
			oauth2ClientId: oauth2Client.id,
			redirectTo: redirectTo,
		} );
	}

	if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		const oauth2Flow = 'crowdsignal';
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		return `${ signupUrl }/${ oauth2Flow }?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client && isWooOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		if ( wccomFrom ) {
			oauth2Params.set( 'wccom-from', wccomFrom );
		}
		return `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client && isJetpackCloudOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		return `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		return `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
	}

	if ( signupFlow ) {
		if ( redirectTo ) {
			const params = new URLSearchParams( {
				redirect_to: redirectTo,
			} );
			return `${ signupUrl }/${ signupFlow }?${ params.toString() }`;
		}
		return `${ signupUrl }/${ signupFlow }`;
	}

	if (
		isFromMigrationPlugin ||
		isFromPublicAPIConnectFlow ||
		( includes( redirectTo, 'action=jetpack-sso' ) && includes( redirectTo, 'sso_nonce=' ) ) ||
		redirectTo
	) {
		const params = new URLSearchParams( {
			redirect_to: redirectTo,
		} );
		return `${ signupUrl }/account?${ params.toString() }`;
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
