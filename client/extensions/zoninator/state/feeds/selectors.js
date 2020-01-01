/**
 * External dependencies
 */

import { get } from 'lodash';

const getFeedsState = state => get( state, 'extensions.zoninator.feeds', {} );

export const isRequestingFeed = ( state, siteId, zoneId ) =>
	get( getFeedsState( state ), [ 'requesting', siteId, zoneId ], false );

/**
 * Returns the posts feed for the specified site and zone ID.
 *
 * @param  {object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Array}         Feed
 */
export const getFeed = ( state, siteId, zoneId ) =>
	get( getFeedsState( state ), [ 'items', siteId, zoneId ], [] );
