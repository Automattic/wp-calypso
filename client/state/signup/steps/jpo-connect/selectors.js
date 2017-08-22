/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Get stored home page as was last chosen by user.
 * @param  {Object} state Global state tree
 * @return {String} Site title in state tree.
 */
export function getJPOConnect( state ) {
	return get( state, [ 'signup', 'dependencyStore', 'jpoConnect' ], '' );
}
