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
import getSiteTitle from 'state/sites/selectors/get-site-title';
import config from 'config';

import { getDocumentHeadTitle } from 'state/document-head/selectors/get-document-head-title';
import { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors/get-document-head-capped-unread-count';

export { getDocumentHeadTitle } from 'state/document-head/selectors/get-document-head-title';
export { getDocumentHeadUnreadCount } from 'state/document-head/selectors/get-document-head-unread-count';
export { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors/get-document-head-capped-unread-count';

/**
 * Returns the formatted document title, based on the currently set title,
 * capped unreadCount, and selected site.
 *
 * @param  {object}  state  Global state tree
 * @returns {string}         Formatted title
 */
export const getDocumentHeadFormattedTitle = createSelector(
	( state ) => {
		let title = '';

		const unreadCount = getDocumentHeadCappedUnreadCount( state );
		if ( unreadCount ) {
			title += `(${ unreadCount }) `;
		}

		title += compact( [
			getDocumentHeadTitle( state ),
			isSiteSection( state ) && getSiteTitle( state, getSelectedSiteId( state ) ),
		] ).join( ' ‹ ' );

		if ( title ) {
			title = decodeEntities( title ) + ' — ';
		}

		return title + config( 'site_name' );
	},
	( state ) => [ state.documentHead, state.ui.section, state.ui.selectedSiteId ]
);

/**
 * Returns an array of document meta objects as set by the DocumentHead
 * component or setDocumentHeadMeta action.
 *
 * @param  {object}  state  Global state tree
 * @returns {object[]}       Array of meta objects
 */
export function getDocumentHeadMeta( state ) {
	return state.documentHead.meta;
}

/**
 * Returns an array of document link objects as set by the DocumentHead
 * component or setDocumentHeadLink action.
 *
 * @param  {object}  state  Global state tree
 * @returns {object[]}       Array of link objects
 */
export function getDocumentHeadLink( state ) {
	return state.documentHead.link;
}
