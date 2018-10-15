/** @format */

/**
 * External dependencies
 */

import { includes, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite, getSiteSlug } from 'state/sites/selectors';

/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Selected site
 */
export function getSelectedSite( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSite( state, siteId );
}

/**
 * Returns the currently selected site ID.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Selected site ID
 */
export function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}

/**
 * Returns the slug of the currently selected site,
 * or null if no site is selected.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Selected site slug
 */
export function getSelectedSiteSlug( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSiteSlug( state, siteId );
}

/**
 * Returns the current section.
 *
 * @param  {Object}  state Global state tree
 * @return {Object}        Current section
 */
export function getSection( state ) {
	return state.ui.section || false;
}

/**
 * Returns the current section name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section name
 */
export function getSectionName( state ) {
	return get( getSection( state ), 'name', null );
}

/**
 * Returns the current section group name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section group name
 */
export function getSectionGroup( state ) {
	return get( getSection( state ), 'group', null );
}

/**
 * Returns true if the current section is a site-specific section.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether current section is site-specific
 */
export function isSiteSection( state ) {
	return includes( [ 'sites', 'editor', 'gutenberg' ], getSectionGroup( state ) );
}

/**
 * Returns whether a section is loading.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether the section is loading
 */
export function isSectionLoading( state ) {
	return state.ui.isLoading;
}

/**
 * Returns true if the current section is isomorphic.
 *
 * @param  {Object}  state Global state tree
 * @return {bool}    True if current section is isomorphic
 *
 * @see client/sections
 */
export function isSectionIsomorphic( state ) {
	return get( getSection( state ), 'isomorphic', false );
}

/**
 * Returns true if WebPreview is currently showing.
 *
 * @param  {Object}  state Global state tree
 * @return {bool}    True if currently showing WebPreview
 *
 * @see client/components/web-preview
 */
export function isPreviewShowing( state ) {
	return get( state.ui, 'isPreviewShowing', false );
}

export function hasSidebar( state ) {
	// this one is weird. defaults to true, so if true, fall through to the secondary prop on the section
	const val = state.ui.hasSidebar;
	if ( val === false ) {
		return false;
	}
	return get( getSection( state ), 'secondary', true );
}

export function masterbarIsVisible( state ) {
	return state.ui.masterbarVisibility;
}
