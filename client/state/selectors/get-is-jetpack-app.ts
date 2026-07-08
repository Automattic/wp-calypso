import 'calypso/state/route/init';
import {
	isSharedMobileAppOAuth2Client,
	isJetpackAppRedirectUri,
	getOAuth2RedirectUri,
} from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from './get-current-query-arguments';
import getInitialQueryArguments from './get-initial-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Whether the current OAuth2 request is from the Jetpack mobile app.
 *
 * The WordPress and Jetpack apps share the same OAuth2 client IDs, so the app is
 * identified by the redirect_uri scheme (`jetpack://`) rather than the client_id.
 */
export default function getIsJetpackApp( state: AppState ): boolean {
	const oauth2Client = getCurrentOAuth2Client( state );

	if ( ! isSharedMobileAppOAuth2Client( oauth2Client ) ) {
		return false;
	}

	const query = getCurrentQueryArguments( state ) ?? getInitialQueryArguments( state );

	return isJetpackAppRedirectUri( getOAuth2RedirectUri( query ) );
}
