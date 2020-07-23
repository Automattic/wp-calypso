/**
 * Internal dependencies
 */
import getNextPageHandle from 'state/selectors/get-next-page-handle';

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

	const currentQuery = state.media.fetching[ siteId ]?.query ?? null;

	return {
		...DEFAULT_QUERY,
		...currentQuery,
		page_handle: getNextPageHandle( state, siteId ),
	};
}
