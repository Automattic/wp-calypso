export { getDocumentHeadTitle } from 'state/document-head/selectors/get-document-head-title';
export { getDocumentHeadUnreadCount } from 'state/document-head/selectors/get-document-head-unread-count';
export { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors/get-document-head-capped-unread-count';
export { getDocumentHeadFormattedTitle } from 'state/document-head/selectors/get-document-head-formatted-title';
export { getDocumentHeadMeta } from 'state/document-head/selectors/get-document-head-meta';

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
