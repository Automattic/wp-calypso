/** @format */

/**
 * Internal dependencies
 */

import { addQueryArgs } from 'lib/url';
import { addLocaleToPath, addLocaleToWpcomUrl } from 'lib/i18n-utils';
import config, { isEnabled } from 'config';

export function login( {
	isJetpack,
	isNative,
	locale,
	redirectTo,
	twoFactorAuthType,
	socialConnect,
	emailAddress,
	socialService,
	oauth2ClientId,
} = {} ) {
	let url = config( 'login_url' );

	if ( isNative && isEnabled( 'login/wp-login' ) ) {
		url = '/log-in';

		if ( socialService ) {
			url += '/' + socialService + '/callback';
		} else if ( twoFactorAuthType ) {
			url += '/' + twoFactorAuthType;
		} else if ( socialConnect ) {
			url += '/social-connect';
		} else if ( isJetpack ) {
			url += '/jetpack';
		}
	}

	if ( locale && locale !== 'en' ) {
		if ( isNative ) {
			url = addLocaleToPath( url, locale );
		} else {
			url = addLocaleToWpcomUrl( url, locale );
		}
	}

	if ( redirectTo ) {
		url = addQueryArgs( { redirect_to: redirectTo }, url );
	}

	if ( emailAddress ) {
		url = addQueryArgs( { email_address: emailAddress }, url );
	}

	if ( oauth2ClientId && ! isNaN( oauth2ClientId ) ) {
		url = addQueryArgs( { client_id: oauth2ClientId }, url );
	}

	return url;
}
