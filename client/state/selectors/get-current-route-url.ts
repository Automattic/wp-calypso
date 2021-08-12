/**
 * Internal dependencies
 */
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { createSelector } from '@automattic/state-utils';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Gets the current route and query string concatenated e.g. '/test/url?foo=bar'
 */
export default createSelector(
	( state: AppState ): string | undefined => {
		const route = getCurrentRoute( state );
		const { _timestamp, ...queryArgs } = { ...getCurrentQueryArguments( state ) };
		const queryString = new URLSearchParams( queryArgs as Record< string, string > ).toString();

		if ( ! route ) {
			return;
		}

		return queryString ? `${ route }?${ queryString }` : route;
	},
	[ getCurrentRoute, getCurrentQueryArguments ]
);
