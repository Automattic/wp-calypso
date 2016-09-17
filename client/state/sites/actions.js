/**
 * Internal dependencies
 */
import {
	SITE_RECEIVE,
	SITE_REQUEST,
	SITES_REQUEST,
} from 'state/action-types';

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

export const requestSites = () => ( {
	type: SITES_REQUEST
} );

export const requestSite = siteId => ( {
	type: SITE_REQUEST,
	siteId,
} );
