/**
 * External dependencies
 */

// None

/**
 * Internal dependencies
 */
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns the URL if SitePreview currently has one.
 *
 * @param  {object}  state Global state tree
 * @returns {?string}  The url or null
 *
 * @see client/blocks/site-preview
 */
export function getPreviewUrl( state ) {
	return state.ui.preview.currentPreviewUrl;
}

/**
 * Returns the site object for the current site set for SitePreview.
 *
 * @param  {object}  state  Global state tree
 * @returns {?object}        Selected site
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
 * @param  {object}  state Global state tree
 * @returns {?number}       Selected preview site ID
 */
export function getPreviewSiteId( state ) {
	const siteId = getSelectedSiteId( state );

	if ( siteId ) {
		return siteId;
	}

	return state.ui.preview.currentPreviewSiteId;
}
