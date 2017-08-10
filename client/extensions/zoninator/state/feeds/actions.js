/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_UPDATE_FEED,
} from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the feed.
 *
 * @param  {Number} siteId Side ID
 * @param  {Number} zoneId Zone ID
 * @return {Action}        Action object
 */
export const requestFeed = ( siteId, zoneId ) => ( {
	type: ZONINATOR_REQUEST_FEED,
	siteId,
	zoneId,
} );

/**
 * Returns an action object to indicate that a feed should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @param  {Object} data   Feed
 * @return {Object}        Action object
 */
export const updateFeed = ( siteId, zoneId, data ) => ( {
	type: ZONINATOR_UPDATE_FEED,
	siteId,
	zoneId,
	data,
} );
