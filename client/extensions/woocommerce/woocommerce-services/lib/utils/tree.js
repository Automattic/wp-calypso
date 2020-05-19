/**
 * External dependencies
 */
import { isArray, isPlainObject, some, values } from 'lodash';

/**
 * Checks if the given tree-like structure has any non-empty terminal nodes.
 *
 * @param {object} tree Root of a tree-like object, can with each node being an object, an array, or a literal value
 * @returns {boolean} True if the tree has some non-empty terminal nodes, false otherwise
 */
export const hasNonEmptyLeaves = ( tree ) => {
	if ( ! tree ) {
		return false;
	}
	if ( isArray( tree ) ) {
		return some( tree, hasNonEmptyLeaves );
	}
	if ( isPlainObject( tree ) ) {
		return some( values( tree ), hasNonEmptyLeaves );
	}
	return true;
};
