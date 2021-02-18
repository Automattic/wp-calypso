/**
 * External dependencies
 */
import { isString, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import getNextPageHandle from 'calypso/state/selectors/get-next-page-handle';
import getCurrentMediaQuery from 'calypso/state/selectors/get-current-media-query';

import 'calypso/state/media/init';

const DEFAULT_QUERY = Object.freeze( { number: 20 } );

/**
 * Returns a new query object to use to fetch the next page of media for a site
 *
 * @param {object} state The state object
 * @param {number} siteId The site ID
 */
export default function getNextPageQuery( state, siteId ) {
	if ( ! ( siteId in state.media.fetching ) ) {
		return DEFAULT_QUERY;
	}

	const currentQuery = getCurrentMediaQuery( state, siteId );

	const pageHandle = getNextPageHandle( state, siteId );

	if ( [ isString, isNumber ].some( ( pred ) => pred( pageHandle ) ) ) {
		return {
			...DEFAULT_QUERY,
			...currentQuery,
			page_handle: pageHandle,
		};
	}

	return {
		...DEFAULT_QUERY,
		...currentQuery,
	};
}
