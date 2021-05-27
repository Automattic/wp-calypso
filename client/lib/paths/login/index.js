/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';
import { addLocaleToPath } from 'calypso/lib/i18n-utils';

export function login( {
	isJetpack = undefined,
	isGutenboarding = undefined,
	locale = undefined,
	redirectTo = undefined,
	twoFactorAuthType = undefined,
	socialConnect = undefined,
	emailAddress = undefined,
	socialService = undefined,
	oauth2ClientId = undefined,
	wccomFrom = undefined,
	site = undefined,
	useMagicLink = undefined,
	from = undefined,
	allowSiteConnection = undefined,
} = {} ) {
	let url = '/log-in';

	if ( socialService ) {
		url += '/' + socialService + '/callback';
	} else if ( twoFactorAuthType && isJetpack ) {
		url += '/jetpack/' + twoFactorAuthType;
	} else if ( twoFactorAuthType && isGutenboarding ) {
		url += '/new/' + twoFactorAuthType;
	} else if ( twoFactorAuthType ) {
		url += '/' + twoFactorAuthType;
	} else if ( socialConnect ) {
		url += '/social-connect';
	} else if ( isJetpack ) {
		url += '/jetpack';
	} else if ( isGutenboarding ) {
		url += '/new';
	} else if ( useMagicLink ) {
		url += '/link';
	}

	if ( locale && locale !== 'en' ) {
		url = addLocaleToPath( url, locale );
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

	if ( wccomFrom ) {
		url = addQueryArgs( { 'wccom-from': wccomFrom }, url );
	}

	if ( from ) {
		url = addQueryArgs( { from }, url );
	}

	if ( allowSiteConnection ) {
		url = addQueryArgs( { allow_site_connection: '1' }, url );
	}

	return url;
}
