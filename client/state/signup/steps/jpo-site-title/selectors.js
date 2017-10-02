/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Get stored site title as was last input by user.
 * @param  {Object} state Global state tree
 * @return {String} Site title in state tree.
 */
export function getJPOSiteTitle( state ) {
	return get( state, [ 'signup', 'dependencyStore', 'jpoSiteTitle', 'siteTitle' ], '' );
}

/**
 * Get stored site description as was last input by user.
 * @param  {Object} state Global state tree
 * @return {String} Site title in state tree.
 */
export function getJPOSiteDescription( state ) {
	return get( state, [ 'signup', 'dependencyStore', 'jpoSiteTitle', 'siteDescription' ], '' );
}