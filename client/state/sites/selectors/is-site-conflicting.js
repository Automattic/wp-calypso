/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteCollisions from './get-site-collisions';

/**
 * Returns true if a collision exists for the specified WordPress.com site ID.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether collision exists
 */
export default function isSiteConflicting( state, siteId ) {
	return includes( getSiteCollisions( state ), siteId );
}
