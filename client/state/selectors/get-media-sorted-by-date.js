/**
 * External dependencies
 */
import { orderBy, values } from 'lodash';

/**
 * Internal dependencies
 */
import getMediaQueryManager from './get-media-query-manager';

/**
 * Returns media for a specified site ID and query.
 *
 *
 * @param {object}  query  Query object
 * @returns {?Array}         Media
 */

export default function getMediaSortedByDate( state, siteId ) {
	const query = state.media.fetching[ siteId ]?.query;
	const queryManager = getMediaQueryManager( state, siteId );

	if ( ! queryManager ) {
		return null;
	}

	const mediaItems = queryManager.getItemsIgnoringPage( query );
	const transientItems = values( state.media.transientItems[ siteId ]?.transientItems );

	return orderBy(
		transientItems.concat( mediaItems ).filter( ( i ) => i ),
		( item ) => Date.parse( item?.date ),
		[ 'desc' ]
	);
}
