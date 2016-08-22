/** @ssr-ready **/

/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { getSelectedSiteId, isSiteSection } from 'state/ui/selectors';
import { getSiteTitle } from 'state/sites/selectors';

const UNREAD_COUNT_CAP = 40;

/**
 * Returns the document title as set by the DocumentHead component or setTitle
 * action.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Document title
 */
export function getTitle( state ) {
	return state.documentHead.title;
}

/**
 * Returns a count reflecting unread items.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Unread count (string because it can be e.g. '40+')
 */
export function getUnreadCount( state ) {
	return state.documentHead.unreadCount;
}

/**
 * Returns a count reflecting unread items, capped at a value determined by
 * UNREAD_COUNT_CAP. Any value greater than the cap yields 'cap+'. Examples:
 * '1', '20', '39', '40+'
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         Unread count (string because it can be e.g. '40+')
 */
export function getCappedUnreadCount( state ) {
	const unreadCount = getUnreadCount( state );
	if ( ! unreadCount ) {
		return '';
	}

	return unreadCount <= UNREAD_COUNT_CAP
		? String( unreadCount )
		: `${ UNREAD_COUNT_CAP }+`;
}

/**
 * Returns the formatted document title, based on the currently set title,
 * capped unreadCount, and selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         Formatted title
 */
export function getFormattedTitle( state ) {
	let title = '';

	const unreadCount = getCappedUnreadCount( state );
	if ( unreadCount ) {
		title += `(${ unreadCount }) `;
	}

	title += compact( [
		getTitle( state ),
		isSiteSection( state ) && getSiteTitle( state, getSelectedSiteId( state ) )
	] ).join( ' ‹ ' );

	if ( title ) {
		title = decodeEntities( title ) + ' — ';
	}

	return title + 'WordPress.com';
}

/**
 * Returns an array of document meta objects as set by the DocumentHead
 * component or addDocumentHeadMeta action.
 *
 * @param  {Object}  state  Global state tree
 * @return {Object[]}       Array of meta objects
 */
export function getMeta( state ) {
	return state.documentHead.meta;
}

/**
 * Returns an array of document link objects as set by the DocumentHead
 * component or addDocumentHeadLink action.
 *
 * @param  {Object}  state  Global state tree
 * @return {Object[]}       Array of link objects
 */
export function getLink( state ) {
	return state.documentHead.link;
}
