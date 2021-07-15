/**
 * External dependencies
 */
import { get, includes, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import {
	isAkismetOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravatarOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
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

export function getSignupUrl(
	currentQuery,
	currentRoute,
	oauth2Client,
	locale,
	pathname,
	isGutenboarding
) {
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

	if ( isAkismetOAuth2Client( oauth2Client ) || isGravatarOAuth2Client( oauth2Client ) ) {
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

	if ( isGutenboarding ) {
		const langFragment = locale && locale !== 'en' ? `/${ locale }` : '';
		const defaultSignupUrl = `/new/plans${ langFragment }?signup`;
		signupUrl = get( currentQuery, 'signup_url', defaultSignupUrl );

		// Sanitize the url if it doesn't start with /new
		if ( ! startsWith( signupUrl, '/new' ) ) {
			signupUrl = defaultSignupUrl;
		}
	}

	if ( oauth2Client && isJetpackCloudOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		signupUrl = `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
	}

	return signupUrl;
}

export const getLoginLinkPageUrl = ( locale = 'en', currentRoute, isGutenboarding ) => {
	const loginParameters = {
		locale,
		twoFactorAuthType: 'link',
	};

	if ( currentRoute === '/log-in/jetpack' ) {
		loginParameters.twoFactorAuthType = 'jetpack/link';
	} else if ( isGutenboarding ) {
		loginParameters.twoFactorAuthType = 'new/link';
	}

	return login( loginParameters );
};

export const canDoMagicLogin = (
	twoFactorAuthType,
	oauth2Client,
	wccomFrom,
	isJetpackWooCommerceFlow
) => {
	if ( ! config.isEnabled( `login/magic-login` ) || twoFactorAuthType ) {
		return false;
	}

	// jetpack cloud cannot have users being sent to WordPress.com
	if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
		return false;
	}

	if ( isWooOAuth2Client( oauth2Client ) && wccomFrom ) {
		return false;
	}

	if ( isJetpackWooCommerceFlow ) {
		return false;
	}

	return true;
};
