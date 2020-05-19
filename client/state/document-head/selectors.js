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

const UNREAD_COUNT_CAP = 40;

/**
 * Returns the document title as set by the DocumentHead component or setTitle
 * action.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Document title
 */
export function getDocumentHeadTitle( state ) {
	return state.documentHead.title;
}

/**
 * Returns a count reflecting unread items.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Unread count (string because it can be e.g. '40+')
 */
export function getDocumentHeadUnreadCount( state ) {
	return state.documentHead.unreadCount;
}

/**
 * Returns a count reflecting unread items, capped at a value determined by
 * UNREAD_COUNT_CAP. Any value greater than the cap yields 'cap+'. Examples:
 * '1', '20', '39', '40+'
 *
 * @param  {object}  state  Global state tree
 * @returns {string}         Unread count (string because it can be e.g. '40+')
 */
export function getDocumentHeadCappedUnreadCount( state ) {
	const unreadCount = getDocumentHeadUnreadCount( state );
	if ( ! unreadCount ) {
		return '';
	}

	return unreadCount <= UNREAD_COUNT_CAP ? String( unreadCount ) : `${ UNREAD_COUNT_CAP }+`;
}

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
