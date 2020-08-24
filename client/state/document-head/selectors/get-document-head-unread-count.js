/**
 * Returns a count reflecting unread items.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Unread count (string because it can be e.g. '40+')
 */
export function getDocumentHeadUnreadCount( state ) {
	return state.documentHead.unreadCount;
}
