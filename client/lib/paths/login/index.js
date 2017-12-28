/** @format */

/**
 * Internal dependencies
 */

import { addQueryArgs } from 'client/lib/url';
import { addLocaleToPath, addLocaleToWpcomUrl } from 'client/lib/i18n-utils';
import config, { isEnabled } from 'config';

export function login(
	{
		isNative,
		locale,
		redirectTo,
		twoFactorAuthType,
		socialConnect,
		emailAddress,
		socialService,
	} = {}
) {
	let url = config( 'login_url' );

	if ( isNative && isEnabled( 'login/wp-login' ) ) {
		url = '/log-in';

		if ( socialService ) {
			url += '/' + socialService + '/callback';
		}

		if ( twoFactorAuthType ) {
			url += '/' + twoFactorAuthType;
		}

		if ( socialConnect ) {
			url += '/social-connect';
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

	return url;
}
