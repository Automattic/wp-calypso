/**
 * Internal dependencies
 */
import {
	SET_SELECTED_SITE,
	RECEIVE_SITE
} from './action-types';

/**
 * Returns an action object to be used in signalling that a site has been set
 * as selected.
 *
 * @param  {Number} siteId Site ID
 * @return {Object}        Action object
 */
export function setSelectedSite( siteId ) {
	return {
		type: SET_SELECTED_SITE,
		siteId
	};
}

/**
 * Returns an action object to be used in signalling that a site object has
 * been received.
 *
 * @param  {Object} site Site received
 * @return {Object}      Action object
 */
export function receiveSite( site ) {
	return {
		type: RECEIVE_SITE,
		site
	};
}
