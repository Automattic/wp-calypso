/**
 * Internal dependencies
 */
import {
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
} from 'state/action-types';

/**
 * Returns an action object signalling that post counts have been received for
 * the site and post type.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @param  {Object} counts   Mapping of post status to count
 * @return {Object}          Action object
 */
export const receivePostCounts = ( siteId, postType, counts ) => ( {
	type: POST_COUNTS_RECEIVE,
	siteId,
	postType,
	counts,
} );

export const requestPostCounts = ( siteId, postType ) => ( {
	type: POST_COUNTS_REQUEST,
	postType,
	siteId
} );
