/**
 * Internal dependencies
 */

import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_REQUEST_FEED_ERROR,
	ZONINATOR_SAVE_FEED,
	ZONINATOR_UPDATE_FEED,
	ZONINATOR_UPDATE_FEED_ERROR,
} from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the feed.
 *
 * @param  {number} siteId Site ID
 * @param  {number} zoneId Zone ID
 * @returns {object}        Action object
 */
export const requestFeed = ( siteId, zoneId ) => ( {
	type: ZONINATOR_REQUEST_FEED,
	siteId,
	zoneId,
} );

/**
 * Returns an action object to indicate that an error was received when fetching a feed.
 *
 * @param  {number} siteId Site ID
 * @param  {number} zoneId Zone ID
 * @returns {object}        Action object
 */
export const requestFeedError = ( siteId, zoneId ) => ( {
	type: ZONINATOR_REQUEST_FEED_ERROR,
	siteId,
	zoneId,
} );

/**
 * Returns an action object to indicate that the feed should be saved.
 *
 * @param  {number} siteId  Site ID
 * @param  {number} zoneId  Zone ID
 * @param  {Array}  posts   Feed posts
 * @returns {object}         Action object
 */
export const saveFeed = ( siteId, zoneId, posts ) => ( {
	type: ZONINATOR_SAVE_FEED,
	siteId,
	zoneId,
	posts,
} );

/**
 * Returns an action object to indicate that a feed should be updated.
 *
 * @param  {number} siteId  Site ID
 * @param  {number} zoneId  Zone ID
 * @param  {Array}  posts   Feed posts
 * @returns {object}         Action object
 */
export const updateFeed = ( siteId, zoneId, posts ) => ( {
	type: ZONINATOR_UPDATE_FEED,
	siteId,
	zoneId,
	posts,
} );

/**
 * Returns an action object to indicate that a feed update has failed.
 *
 * @param  {number} siteId  Site ID
 * @param  {number} zoneId  Zone ID
 * @returns {object}         Action object
 */
export const updateFeedError = ( siteId, zoneId ) => ( {
	type: ZONINATOR_UPDATE_FEED_ERROR,
	siteId,
	zoneId,
} );
