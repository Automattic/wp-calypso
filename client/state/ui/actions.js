/**
 * Internal dependencies
 */
import {
	SET_SELECTED_SITE,
	SET_SECTION,
	USER_SET_CURRENT
} from 'state/action-types';

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
 * Returns an action object to be used in signalling that the current user ID
 * has been set.
 *
 * @param  {Number} userId User ID
 * @return {Object}        Action object
 */
export function setCurrentUser( userId ) {
	return {
		type: USER_SET_CURRENT,
		userId
	};
}

export function setSection( section, options = {} ) {
	options.type = SET_SECTION;
	if ( section ) {
		options.section = section;
	}
	options.hasSidebar = ( options.hasSidebar === false ) ? false : true;
	return options;
}
