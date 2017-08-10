/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if a comment tree has been initialized.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   The ID of the site we're querying
 * @param  {String}  status   unapproved|approved|all|spam|trash
 * @return {Boolean} True if the comment tree has been initialized
 */
export default function isCommentsTreeInitialized( state, siteId, status ) {
	return get( state, [ 'comments', 'treesInitialized', siteId, status ], false );
}
