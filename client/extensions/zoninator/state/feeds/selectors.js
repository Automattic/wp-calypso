/**
 * External dependencies
 */

import { get } from 'lodash';

const getFeedsState = ( state ) => get( state, 'extensions.zoninator.feeds', {} );

export const isRequestingFeed = ( state, siteId, zoneId ) =>
	get( getFeedsState( state ), [ 'requesting', siteId, zoneId ], false );

/**
 * Returns the posts feed for the specified site and zone ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @param  {number} zoneId Zone ID
 * @returns {Array}         Feed
 */
export const getFeed = ( state, siteId, zoneId ) =>
	get( getFeedsState( state ), [ 'items', siteId, zoneId ], [] );
