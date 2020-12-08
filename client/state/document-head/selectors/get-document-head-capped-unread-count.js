/**
 * Internal dependencies
 */
import { getDocumentHeadUnreadCount } from 'calypso/state/document-head/selectors/get-document-head-unread-count';

const UNREAD_COUNT_CAP = 40;

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
