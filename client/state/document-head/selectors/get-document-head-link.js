import 'calypso/state/document-head/init';

/**
 * Returns an array of document link objects as set by the DocumentHead
 * component or setDocumentHeadLink action.
 *
 * @param  {Object}  state  Global state tree
 * @returns {Object[]}       Array of link objects
 */
export function getDocumentHeadLink( state ) {
	return state.documentHead.link;
}
