import { addLocaleToPath } from 'calypso/lib/i18n-utils';
import { addQueryArgs } from 'calypso/lib/url';

/**
 * @param {{
	isJetpack?: boolean;
	isGutenboarding?: boolean;
	isWhiteLogin?: boolean;
	locale?: string;
	redirectTo?: string;
	twoFactorAuthType?: string;
	socialConnect?: boolean;
	emailAddress?: string;
	socialService?: string;
	oauth2ClientId?: string | number;
	wccomFrom?: string;
	site?: string;
	useMagicLink?: boolean;
	from?: string;
	allowSiteConnection?: boolean;
	signupUrl?: string;
 }} args The arguments
 * @returns {string}
 */
export function login( {
	isJetpack = undefined,
	isGutenboarding = undefined,
	isWhiteLogin = undefined,
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
	signupUrl = undefined,
} = {} ) {
	let url = '/log-in';

	if ( socialService ) {
		url += '/' + socialService + '/callback';
	} else if ( twoFactorAuthType && isJetpack ) {
		url += '/jetpack/' + twoFactorAuthType;
	} else if ( twoFactorAuthType && ( isGutenboarding || isWhiteLogin ) ) {
		url += '/new/' + twoFactorAuthType;
	} else if ( twoFactorAuthType ) {
		url += '/' + twoFactorAuthType;
	} else if ( socialConnect ) {
		url += '/social-connect';
	} else if ( isJetpack ) {
		url += '/jetpack';
	} else if ( isGutenboarding || isWhiteLogin ) {
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
		url = redirectTo.includes( 'jetpack-sso' )
			? redirectTo
			: addQueryArgs( { redirect_to: redirectTo }, url );
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

	if ( signupUrl ) {
		url = addQueryArgs( { signup_url: signupUrl }, url );
	}

	if ( allowSiteConnection ) {
		url = addQueryArgs( { allow_site_connection: '1' }, url );
	}

	return url;
}
