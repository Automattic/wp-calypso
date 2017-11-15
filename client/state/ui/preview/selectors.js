/** @format */

/**
 * External dependencies
 */

// None

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export function getCurrentPreviewType( state ) {
	return state.ui.preview.currentPreviewType;
}
/**
 * Returns the URL if SitePreview currently has one.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}  The url or null
 *
 * @see client/components/design-preview
 */
export function getPreviewUrl( state ) {
	return state.ui.preview.currentPreviewUrl;
}

/**
 * Returns the site object for the current site set for SitePreview.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Selected site
 */
export function getPreviewSite( state ) {
	const siteId = getPreviewSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSite( state, siteId );
}

/**
 * Returns the site ID for SitePreview for use in "All My Sites".
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Selected preview site ID
 */
export function getPreviewSiteId( state ) {
	const siteId = getSelectedSiteId( state );

	if ( siteId ) {
		return siteId;
	}

	return state.ui.preview.currentPreviewSiteId;
}

export function getActiveDesignTool( state ) {
	return state.ui.preview.activeDesignTool;
}
