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
