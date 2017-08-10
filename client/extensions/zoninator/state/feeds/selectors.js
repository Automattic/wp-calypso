/**
 * External dependencies
 */
import { get } from 'lodash';

const getFeedsState = ( state ) => state.extensions.zoninator.feeds;

/**
 * Returns the posts feed for the specified site and zone ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Array}         Feed
 */
export const getFeed = ( state, siteId, zoneId ) =>
	get( getFeedsState( state ), [ 'items', siteId, zoneId ], [] );
