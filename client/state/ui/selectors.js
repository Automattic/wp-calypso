/** @ssr-ready **/

/**
 * External dependencies
 */
import { includes, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';

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
 * Returns the current section name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section name
 */
export function getSectionName( state ) {
	return get( state.ui.section, 'name', null );
}

/**
 * Returns the current section group name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section group name
 */
export function getSectionGroup( state ) {
	return get( state.ui.section, 'group', null );
}

/**
 * Returns true if the current section is a site-specific section.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether current section is site-specific
 */
export function isSiteSection( state ) {
	return includes( [ 'sites', 'editor' ], getSectionGroup( state ) );
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
	return get( state.ui.section, 'isomorphic', false );
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

export function getInitialQueryArguments( state ) {
	return state.ui.queryArguments.initial;
}

export function getCurrentQueryArguments( state ) {
	return state.ui.queryArguments.current;
}

export function hasSidebar( state ) {
	// this one is weird. defaults to true, so if true, fall through to the secondary prop on the section
	const val = state.ui.hasSidebar;
	if ( val === false ) {
		return false;
	}
	return get( state.ui.section, 'secondary', true );
}
