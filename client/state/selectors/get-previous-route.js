import { stringify } from 'qs';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import getPreviousQuery from 'calypso/state/selectors/get-previous-query';
/**
 * Gets the previous route set by a ROUTE_SET action
 *
 * @param {Object} state - global redux state
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
