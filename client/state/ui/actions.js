/**
 * Internal dependencies
 */
import {
	TITLE_SET,
	SELECTED_SITE_SET,
	SET_SECTION
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the current page
 * title should be set to the specified value.
 *
 * @param  {String} title Page title
 * @return {Object}       Action object
 */
export function setTitle( title ) {
	return {
		type: TITLE_SET,
		title
	};
}

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
		siteId
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
		siteId: null
	};
}

export function setSection( section, options = {} ) {
	options.type = SET_SECTION;
	if ( section ) {
		options.section = section;
	}
	options.hasSidebar = ( options.hasSidebar === false ) ? false : true;
	options.isFullScreen = !! options.isFullScreen;
	return options;
}
