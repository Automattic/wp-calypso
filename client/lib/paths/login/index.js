/** @format */

/**
 * Internal dependencies
 */

import { addQueryArgs } from 'lib/url';
import { addLocaleToPath, localizeUrl } from 'lib/i18n-utils';
import config, { isEnabled } from 'config';

export function login( {
	isJetpack,
	isWoo,
	isNative,
	locale,
	redirectTo,
	twoFactorAuthType,
	socialConnect,
	emailAddress,
	socialService,
	oauth2ClientId,
	wccomFrom,
	site,
	useMagicLink,
} = {} ) {
	let url = '';

	if ( isNative && isEnabled( 'login/wp-login' ) ) {
		if ( socialService ) {
			url = `/${ socialService === 'apple' ? 'sign-in' : 'log-in' }/${ socialService }/callback`;
		} else if ( twoFactorAuthType && isJetpack ) {
			url = '/log-in/jetpack/' + twoFactorAuthType;
		} else if ( twoFactorAuthType ) {
			url = '/log-in/' + twoFactorAuthType;
		} else if ( socialConnect ) {
			url = '/log-in/social-connect';
		} else if ( isJetpack ) {
			url = '/log-in/jetpack';
		} else if ( useMagicLink ) {
			url = '/log-in/link';
		} else {
			url = '/log-in';
		}
	} else {
		url = config( 'login_url' );
	}

	if ( locale && locale !== 'en' ) {
		if ( isNative ) {
			url = addLocaleToPath( url, locale );
		} else {
			url = localizeUrl( url, locale );
		}
	}

	if ( site ) {
		url = addQueryArgs( { site }, url );
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

	if ( isWoo ) {
		url = addQueryArgs( { from: 'woocommerce-setup-wizard' }, url );
	}

	if ( wccomFrom ) {
		url = addQueryArgs( { 'wccom-from': wccomFrom }, url );
	}

	return url;
}
