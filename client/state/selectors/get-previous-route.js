/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import getPreviousPath from 'state/selectors/get-previous-path';
import getPreviousQuery from 'state/selectors/get-previous-query';
/**
 * Gets the previous route set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {string} previous route value
 */

export const getPreviousRoute = ( state ) => {
	const previousPath = getPreviousPath( state );
	const previousQuery = getPreviousQuery( state );
	let query = '';
	if ( previousQuery ) {
		query = '?' + stringify( previousQuery );
	}
	return previousPath + query;
};

export default getPreviousRoute;
