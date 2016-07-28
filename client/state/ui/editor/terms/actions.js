/**
 * Internal dependencies
 */
import { EDITOR_TERM_ADDED_SET } from 'state/action-types';

/**
 * Returns an action object signalling that a new term has been added
 * for a site, post, taxonomy combination
 *
 * @param  {Number} siteId   Site ID
 * @param  {Number} postId   Post ID
 * @param  {string} taxonomy Taxonomy name
 * @param  {Number} termId   Term ID
 * @return {Object} Action   object
 */
export function setEditorAddedTerm( siteId, postId, taxonomy, termId ) {
	return {
		type: EDITOR_TERM_ADDED_SET,
		siteId,
		postId,
		taxonomy,
		termId
	};
}

/**
 * Returns an action object that signals the term added for a site, post and taxonomy combo
 * should be reset
 *
 * @param  {Number} siteId   Site ID
 * @param  {Number} postId   Post ID
 * @param  {string} taxonomy Taxonomy name
 * @return {Object} Action object
 */
export function resetEditorTermAdded( siteId, postId, taxonomy ) {
	return setEditorAddedTerm( siteId, postId, taxonomy, null );
}
