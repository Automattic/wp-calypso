/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { getTerm } from 'state/terms/selectors';

/**
 * Returns the last term added for a site, post, taxonomy combo
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {Number}  postId   Post ID
 * @param  {String}  taxonomy Taxonomy slug
 * @return {?Object}          Last edited draft site ID
 */
export function getEditorTermAdded( state, siteId, postId, taxonomy ) {
	const termId = get( state.ui.editor.terms.added, [ siteId, postId, taxonomy ], null );

	if ( ! termId ) {
		return null;
	}

	return getTerm( state, siteId, taxonomy, termId );
}
