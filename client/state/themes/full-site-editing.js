/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

const FULL_SITE_EDITING_THEMES = [ 'maywood' ];

/**
 * Checks to see if a theme supports Full Site Editing
 *
 * @param {string} theme A theme ID as returned by the REST API (no pub/ etc prefixes)
 * @returns {bool} True if the theme supports Full Site Editing
 */
export function themeSupportsFullSiteEditing( theme ) {
	return includes( FULL_SITE_EDITING_THEMES, theme );
}
