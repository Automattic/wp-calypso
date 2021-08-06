/**
 * Internal dependencies
 */
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { createSelector } from '@automattic/state-utils';

/**
 * Gets the current route and query string concatenated e.g. '/test/url?foo=bar'
 */
export default createSelector(
	( state ) => {
		const route = getCurrentRoute( state );
		const { _timestamp, ...queryArgs } = getCurrentQueryArguments( state ) || {};
		const queryString = new URLSearchParams( queryArgs ).toString();

		if ( ! route ) {
			return;
		}

		return queryString ? `${ route }?${ queryString }` : route;
	},
	[ getCurrentRoute, getCurrentQueryArguments ]
);
