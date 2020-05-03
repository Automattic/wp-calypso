/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {object} ancestor potential ancestor comment
 * @param {object} child potential child comment
 * @param {object} commentsTree commentsTree for a post, see associated getPostCommentsTree selector
 *
 * @returns {boolean} return true if parent is an ancestor of child
 */
export const isAncestor = ( ancestor, child, commentsTree ) => {
	if ( ! ancestor || ! child || ! child.parent || ! commentsTree ) {
		return false;
	}

	const nextParent = get( commentsTree, [ child.parent.ID, 'data' ] );

	return child.parent.ID === ancestor.ID || isAncestor( ancestor, nextParent, commentsTree );
};
