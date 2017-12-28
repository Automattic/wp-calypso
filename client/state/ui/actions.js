/** @format */

/**
 * Internal dependencies
 */

import {
	SELECTED_SITE_SET,
	ROUTE_SET,
	SECTION_SET,
	PREVIEW_IS_SHOWING,
	NOTIFICATIONS_PANEL_TOGGLE,
	NAVIGATE,
} from 'client/state/action-types';

/**
 * Returns an action object to be used in signalling that a site has been set
 * as selected.
 *
 * @param  {Number} siteId Site ID
 * @return {Object}        Action object
 */
export function setSelectedSiteId( siteId ) {
	return {
		type: SELECTED_SITE_SET,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that all sites have been
 * set as selected.
 *
 * @return {Object}        Action object
 */
export function setAllSitesSelected() {
	return {
		type: SELECTED_SITE_SET,
		siteId: null,
	};
}

/**
 * Returns an action object signalling that the current route is to be changed
 *
 * @param  {String} path    Route path
 * @param  {Object} [query] Query arguments
 * @return {Object}         Action object
 */
export function setRoute( path, query = {} ) {
	return {
		type: ROUTE_SET,
		path,
		query,
	};
}

export function setSection( section, options = {} ) {
	options.type = SECTION_SET;
	if ( section ) {
		options.section = section;
	}
	options.hasSidebar = options.hasSidebar === false ? false : true;
	return options;
}

export function setPreviewShowing( isShowing ) {
	return {
		type: PREVIEW_IS_SHOWING,
		isShowing,
	};
}

/**
 * Sets ui state to toggle the notifications panel
 *
 * @returns {Object} An action object
 */
export const toggleNotificationsPanel = () => {
	return {
		type: NOTIFICATIONS_PANEL_TOGGLE,
	};
};

/**
 * Returns an action object signalling navigation to the given path.
 *
 * @param  {String} path Navigation path
 * @return {Object}      Action object
 */
export const navigate = path => ( { type: NAVIGATE, path } );
