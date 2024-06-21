import { getQueryArg } from '@wordpress/url';
import { isA4AOAuth2Client } from 'calypso/lib/oauth2-clients';

export function isA4AReferralClient( query, oauth2Client ) {
	if ( ! isA4AOAuth2Client( oauth2Client ) ) {
		return false;
	}

	const redirectTo = decodeURI( query.redirect_to );
	// redirectTo has `redirect_uri` encoded inside it.
	const params = getQueryArg( redirectTo, 'redirect_uri' );

	return params.includes( '/client/' );
}
