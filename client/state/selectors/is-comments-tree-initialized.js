/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/comments/init';

/**
 * Returns true if a comment tree has been initialized.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   The ID of the site we're querying
 * @param  {string}  status   unapproved|approved|all|spam|trash
 * @returns {boolean} True if the comment tree has been initialized
 */
export default function isCommentsTreeInitialized( state, siteId, status ) {
	if ( 'all' === status ) {
		const tree = get( state, [ 'comments', 'treesInitialized', siteId ] );
		return tree && ( tree.approved || tree.unapproved );
	}

	return get( state, [ 'comments', 'treesInitialized', siteId, status ], false );
}
