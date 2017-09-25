/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import { addLocaleToPath, addLocaleToWpcomUrl } from 'lib/i18n-utils';
import { addQueryArgs } from 'lib/url';

export function login( { isNative, locale, redirectTo, twoFactorAuthType, socialConnect, emailAddress } = {} ) {
	let url = config( 'login_url' );

	if ( isNative && isEnabled( 'login/wp-login' ) ) {
		url = '/log-in';

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
