/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getBlogStickers from 'state/selectors/get-blog-stickers';
import { hasStaticFrontPage } from 'state/sites/selectors';
import { getActiveTheme } from 'state/themes/selectors';

/**
 * List of themes that are supported by Full Site Editing so we can call it "active"
 *
 * @type {Array}
 */
const supportedThemes = [ 'modern-business' ];

/**
 * Checks if a site is using the new Full Site Editing experience
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} True if the site is using Full Site Editing, otherwise false
 */
export default function isSiteUsingFullSiteEditing( state, siteId ) {
	const stickers = getBlogStickers( state, siteId );
	const activeTheme = getActiveTheme( state, siteId );
	return (
		hasStaticFrontPage( state, siteId ) &&
		includes( supportedThemes, activeTheme ) &&
		includes( stickers, 'full-site-editing' )
	);
}
