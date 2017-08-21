/**
 * Internal dependencies
 */
import {
	SITE_DELETE,
	SITE_DELETE_RECEIVE,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_UPDATE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a site has been
 * deleted.
 *
 * @param  {Number} siteId ID of deleted site
 * @return {Object}        Action object
 */
export function receiveDeletedSite( siteId ) {
	return {
		type: SITE_DELETE_RECEIVE,
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
		type: SITE_RECEIVE,
		site
	};
}

/**
 * Returns an action object to be used in signalling that site objects have
 * been received.
 *
 * @param  {Object[]} sites Sites received
 * @return {Object}         Action object
 */
export function receiveSites( sites ) {
	return {
		type: SITES_RECEIVE,
		sites
	};
}

/**
 * Returns an action object to be used in signalling that sites objects have
 * been updated.
 *
 * @param  {Object[]} sites Sites updated
 * @return {Object}         Action object
 */
export function receiveSiteUpdates( sites ) {
	return {
		type: SITES_UPDATE,
		sites
	};
}

/**
 * Returns an action object that signals the intention to request all visible sites
 * @param  {Function}   onSuccess function to be called once sites are requested with success
 * @returns {Object}              Action object
 */
export function requestSites( onSuccess ) {
	if ( onSuccess ) {
		return {
			type: SITES_REQUEST,
			meta: {
				onSuccess
			}
		};
	}
	return {
		type: SITES_REQUEST
	};
}

/**
 * Returns an action object that signals the intention to fetch a site.
 *
 * @param  {Number}   siteId Site ID
 * @returns {Object}        Action object
 */
export function requestSite( siteId ) {
	return {
		type: SITE_REQUEST,
		siteId
	};
}

/**
 * Returns an action object that signals the intention to delete a site.
 *
 * @param  {Number}   siteId Site ID
 * @returns {Object}        Action object
 */
export function deleteSite( siteId ) {
	return {
		type: SITE_DELETE,
		siteId
	};
}
