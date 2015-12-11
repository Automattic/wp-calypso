/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE } from 'state/action-types';

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

