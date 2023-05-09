import 'calypso/state/document-head/init';

/**
 * Returns the document title as set by the DocumentHead component or setTitle
 * action.
 *
 * @param  {Object}  state  Global state tree
 * @returns {?string}        Document title
 */
export function getDocumentHeadTitle( state ) {
	return state.documentHead.title;
}
