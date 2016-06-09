/** @ssr-ready **/

/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SET_SECTION,
	PREVIEW_IS_SHOWING,
} from 'state/action-types';

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
	return options;
}

export function setPreviewShowing( isShowing ) {
	return {
		type: PREVIEW_IS_SHOWING,
		isShowing,
	};
}
