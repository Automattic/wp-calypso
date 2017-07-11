/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import { addLocaleToPath } from 'lib/i18n-utils';
import config, { isEnabled } from 'config';

export const login = ( { isNative, locale, redirectTo, twoFactorAuthType } = {} ) => {
	let url = config( 'login_url' );

	if ( isNative && isEnabled( 'login/wp-login' ) ) {
		url = '/log-in';

		if ( twoFactorAuthType ) {
			url += '/' + twoFactorAuthType;
		}
	}

	if ( locale && locale !== 'en' ) {
		if ( isNative ) {
			url = addLocaleToPath( url, locale );
		} else {
			url = url.replace( 'https://wordpress.com', 'https://' + locale + '.wordpress.com' );
		}
	}

	if ( redirectTo ) {
		url = addQueryArgs( { redirect_to: redirectTo }, url );
	}

	return url;
};
