import config from '@automattic/calypso-config';
import { addLocaleToPath, isDefaultLocale } from '@automattic/i18n-utils';
import { getLocaleSlug } from 'i18n-calypso';
import { get, includes, startsWith } from 'lodash';
import {
	isAkismetOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isGravPoweredOAuth2Client,
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isWooOAuth2Client,
	isIntenseDebateOAuth2Client,
	isStudioAppOAuth2Client,
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

	const cleanPath = path
		.replace( /<\/?[^>]+(>|$)/g, '' )
		.replace( /^[a-zA-Z][a-zA-Z\d+\-.]*:/, '' )
		.replace( /\s/g, '' );
	return cleanPath ? `/${ cleanPath.replace( /^\/+/, '' ) }` : '';
}

export function getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname ) {
	const redirectTo = get( currentQuery, 'redirect_to', '' );

	if (
		// Match locales like `/log-in/jetpack/es`
		startsWith( currentRoute, '/log-in/jetpack' )
	) {
		// Basic validation that we're in a valid Jetpack Authorization flow
		if (
			includes( redirectTo, '/jetpack/connect/authorize' ) &&
			includes( redirectTo, '_wp_nonce' )
		) {
			// If the current query has plugin_name param, but redirect_to doesn't, add it to the redirect_to
			const pluginName = get( currentQuery, 'plugin_name' );
			try {
				const urlObj = new URL( redirectTo );
				if ( ! urlObj.searchParams.has( 'plugin_name' ) && pluginName ) {
					urlObj.searchParams.set( 'plugin_name', pluginName );
					return urlObj.toString();
				}
			} catch ( e ) {
				return '/jetpack/connect';
			}

			/**
			 * `log-in/jetpack/:locale` is reached as part of the Jetpack connection flow. In
			 * this case, the redirect_to will handle signups as part of the flow. Use the
			 * `redirect_to` parameter directly for signup.
			 */
			return redirectTo;
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
		return `/start/${ oauth2Flow }?${ oauth2Params.toString() }`;
	}

	if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
		const gravatarFrom = get( currentQuery, 'gravatar_from', 'signup' );

		// Gravatar powered clients signup via the magic login page
		return login( {
			locale,
			twoFactorAuthType: 'link',
			oauth2ClientId: oauth2Client.id,
			redirectTo: redirectTo,
			gravatarFrom: isGravatarOAuth2Client( oauth2Client ) && gravatarFrom,
			gravatarFlow: isGravatarFlowOAuth2Client( oauth2Client ),
		} );
	}

	if ( isStudioAppOAuth2Client( oauth2Client ) ) {
		// Studio app signup via the magic login page
		return login( {
			locale,
			twoFactorAuthType: 'link',
			oauth2ClientId: oauth2Client.id,
			redirectTo: redirectTo,
		} );
	}

	if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		return `/start/crowdsignal?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client && isWooOAuth2Client( oauth2Client ) ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );

		const wccomFrom = get( currentQuery, 'wccom-from' );
		if ( wccomFrom ) {
			oauth2Params.set( 'wccom-from', wccomFrom );
		}
		return `/start/wpcc?${ oauth2Params.toString() }`;
	}

	if ( oauth2Client ) {
		const oauth2Params = new URLSearchParams( {
			oauth2_client_id: oauth2Client.id,
			oauth2_redirect: redirectTo,
		} );
		return `/start/wpcc?${ oauth2Params.toString() }`;
	}

	const signupFlow = get( currentQuery, 'signup_flow' );
	if ( signupFlow ) {
		if ( redirectTo ) {
			const params = new URLSearchParams( {
				redirect_to: redirectTo,
			} );
			return `/start/${ signupFlow }?${ params.toString() }`;
		}
		return `/start/${ signupFlow }`;
	}

	if ( redirectTo ) {
		const params = new URLSearchParams( {
			redirect_to: redirectTo,
		} );
		return `/start/account?${ params.toString() }`;
	}

	if ( ! isDefaultLocale( locale ) ) {
		return addLocaleToPath( '/start', locale );
	}

	return '/start';
}

export const canDoMagicLogin = ( twoFactorAuthType, oauth2Client ) => {
	if ( ! config.isEnabled( `login/magic-login` ) || twoFactorAuthType ) {
		return false;
	}

	// jetpack cloud cannot have users being sent to WordPress.com
	if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
		return false;
	}

	// Automattic for Agencies cannot have users being sent to WordPress.com
	if ( isA4AOAuth2Client( oauth2Client ) ) {
		return false;
	}

	return true;
};

export const getLoginLinkPageUrl = ( {
	locale = 'en',
	currentRoute,
	signupUrl,
	oauth2ClientId,
	...additionalParams
} ) => {
	// The email address from the URL (if present) is added to the login
	// parameters in this.handleMagicLoginLinkClick(). But it's left out
	// here deliberately, to ensure that if someone copies this link to
	// paste somewhere else, their email address isn't included in it.
	const loginParameters = {
		locale: locale,
		twoFactorAuthType: 'link',
		signupUrl,
		oauth2ClientId,
		...additionalParams,
	};

	if ( currentRoute === '/log-in/jetpack' ) {
		loginParameters.twoFactorAuthType = 'jetpack/link';
	}

	return login( loginParameters );
};

export const formatPluginNames = ( pluginName, translate, langSlug = getLocaleSlug() ) => {
	const allowedPluginNames = {
		'jetpack-ai': translate( 'Jetpack' ),
		'woocommerce-payments': translate( 'WooPayments' ),
	};

	// Handle multiple plugin names separated by commas
	const titles = pluginName.split( ',' ).map( ( name ) => allowedPluginNames[ name.trim() ] );
	const uniqueTitles = Array.from( new Set( titles ) ).filter( ( title ) => title );

	const listFormatter = new Intl.ListFormat( langSlug, {
		style: 'long',
		type: 'conjunction',
	} );

	return uniqueTitles.length ? listFormatter.format( uniqueTitles ) : '';
};

export const getPluginTitle = ( pluginName, translate, langSlug = getLocaleSlug() ) => {
	const defaultTitle = translate( 'of the extensions you’ve chosen' );
	if ( ! pluginName ) {
		// Handle null, undefined, or empty strings
		return defaultTitle;
	}

	const formattedNames = formatPluginNames( pluginName, translate, langSlug );
	if ( ! formattedNames ) {
		return defaultTitle;
	}

	return translate( 'in %(pluginNames)s', {
		args: { pluginNames: formattedNames },
		comment: 'pluginNames is a list of WordPress extensions',
	} );
};
