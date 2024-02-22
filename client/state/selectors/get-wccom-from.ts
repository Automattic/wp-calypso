import { get } from 'lodash';
import 'calypso/state/route/init';
import getCurrentQueryArguments from './get-current-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Return the value of the `wccom-from` query argument.
 *
 * Login flow and signup flow use different query arguments to pass the `wccom-from` value.
 * Login flow uses `wccom-from` directly, while signup flow uses `oauth2_redirect` to pass the `wccom-from` value.
 */
export default function getWccomFrom( state: AppState ): string | null {
	const currentQuery = getCurrentQueryArguments( state );
	const wccomFrom = get( currentQuery, 'wccom-from' ) as string | null;

	if ( wccomFrom ) {
		return wccomFrom;
	}

	try {
		const queryOauth2Redirect = currentQuery?.oauth2_redirect;
		const oauth2RedirectUrl = new URL( queryOauth2Redirect as string );
		return oauth2RedirectUrl.searchParams.get( 'wccom-from' );
	} catch ( e ) {
		// ignore
	}

	return null;
}
