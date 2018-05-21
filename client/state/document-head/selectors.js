/** @format */

/**
 * External dependencies
 */

import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { decodeEntities } from 'lib/formatting';
import { getSelectedSiteId, isSiteSection } from 'state/ui/selectors';
import { getSiteTitle } from 'state/sites/selectors';

/**
 * Returns the document title as set by the DocumentHead component or setTitle
 * action.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Document title
 */
export function getDocumentHeadTitle( state ) {
	return state.documentHead.title;
}

/**
 * Returns the formatted document title, based on the currently set title
 * and selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         Formatted title
 */
export const getDocumentHeadFormattedTitle = createSelector(
	state => {
		let title = compact( [
			getDocumentHeadTitle( state ),
			isSiteSection( state ) && getSiteTitle( state, getSelectedSiteId( state ) ),
		] ).join( ' ‹ ' );

		if ( title ) {
			title = decodeEntities( title ) + ' — ';
		}

		return title + 'WordPress.com';
	},
	state => [ state.documentHead, state.ui.section, state.ui.selectedSiteId ]
);

/**
 * Returns an array of document meta objects as set by the DocumentHead
 * component or setDocumentHeadMeta action.
 *
 * @param  {Object}  state  Global state tree
 * @return {Object[]}       Array of meta objects
 */
export function getDocumentHeadMeta( state ) {
	return state.documentHead.meta;
}

/**
 * Returns an array of document link objects as set by the DocumentHead
 * component or setDocumentHeadLink action.
 *
 * @param  {Object}  state  Global state tree
 * @return {Object[]}       Array of link objects
 */
export function getDocumentHeadLink( state ) {
	return state.documentHead.link;
}
