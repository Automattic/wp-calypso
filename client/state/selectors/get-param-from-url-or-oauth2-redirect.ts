import { get } from 'lodash';
import 'calypso/state/route/init';
import getCurrentQueryArguments from './get-current-query-arguments';
import getInitialQueryArguments from './get-initial-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Return the value of the given search query argument.
 *
 * Login flow and signup flow use different query arguments to pass the `wccom-from` or `woo-passwordless` values.
 * Login flow uses the parameter in the url directly, while signup flow uses `oauth2_redirect` to pass the parameter.
 */
export const getParamFromUrlOrOauth2Redirect = (
	state: AppState,
	paramName: string
): string | null => {
	const initialQuery = getInitialQueryArguments( state );
	const currentQuery = getCurrentQueryArguments( state );
	const paramValue = get( currentQuery, paramName ) as string | null;

	if ( paramValue ) {
		return paramValue;
	}

	try {
		const queryOauth2Redirect =
			currentQuery?.oauth2_redirect ||
			currentQuery?.redirect_to ||
			initialQuery?.oauth2_redirect ||
			initialQuery?.redirect_to;

		const oauth2RedirectUrl = new URL( queryOauth2Redirect as string );

		return oauth2RedirectUrl.searchParams.get( paramName );
	} catch ( e ) {
		// ignore
	}

	return null;
};
