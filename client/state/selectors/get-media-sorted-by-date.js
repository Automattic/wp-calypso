/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import getMediaQueryManager from './get-media-query-manager';
import { sortItemsByDate } from 'calypso/lib/media/utils/sort-items-by-date';

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

	return sortItemsByDate( transientItems.concat( mediaItems ).filter( ( i ) => i ) );
}
