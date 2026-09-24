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

	// The redirect_uri that distinguishes the Jetpack app from the WordPress app lives
	// only on the initial login URL. Navigating to a 2FA sub-route (e.g. `/log-in/webauthn`)
	// lands on a query that no longer carries it, and that query is a non-nullish object,
	// so a whole-query `??` fallback would never reach the initial query. Fall back on the
	// redirect_uri itself instead, so the app identity survives across the 2FA screens.
	const redirectUri =
		getOAuth2RedirectUri( getCurrentQueryArguments( state ) ) ??
		getOAuth2RedirectUri( getInitialQueryArguments( state ) );

	return isJetpackAppRedirectUri( redirectUri );
}
