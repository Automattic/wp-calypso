/**
 * Internal dependencies
 */
import { ZONINATOR_REQUEST_FEED, ZONINATOR_SAVE_FEED, ZONINATOR_UPDATE_FEED } from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the feed.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Action}        Action object
 */
export const requestFeed = ( siteId, zoneId ) => ( {
	type: ZONINATOR_REQUEST_FEED,
	siteId,
	zoneId,
} );

/**
 * Returns an action object to indicate that the feed should be saved.
 *
 * @param  {Number} siteId  Site ID
 * @param  {Number} zoneId  Zone ID
 * @param  {String} zoneId  Form name
 * @param  {Array}  posts   Feed posts
 * @return {Object}         Action object
 */
export const saveFeed = ( siteId, zoneId, form, posts ) => ( {
	type: ZONINATOR_SAVE_FEED,
	siteId,
	zoneId,
	form,
	posts,
} );

/**
 * Returns an action object to indicate that a feed should be updated.
 *
 * @param  {Number} siteId  Site ID
 * @param  {Number} zoneId  Zone ID
 * @param  {Array}  posts   Feed posts
 * @return {Object}         Action object
 */
export const updateFeed = ( siteId, zoneId, posts ) => ( {
	type: ZONINATOR_UPDATE_FEED,
	siteId,
	zoneId,
	posts,
} );
