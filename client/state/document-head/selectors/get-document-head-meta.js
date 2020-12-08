/**
 * Internal dependencies
 */
import 'calypso/state/document-head/init';

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
