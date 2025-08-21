import isAkismetRedirect from 'calypso/lib/akismet/is-akismet-redirect';
import { isAkismetOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import type { AppState } from 'calypso/types';

/**
 * Return if it's Akismet (either via Akismet OAuth client or Akismet redirect)
 */
export default function getIsAkismet( state: AppState ): boolean {
	return (
		isAkismetOAuth2Client( getCurrentOAuth2Client( state ) ) ||
		isAkismetRedirect(
			new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'back' )
		)
	);
}
