import { stringify } from 'qs';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import getPreviousQuery from 'calypso/state/selectors/get-previous-query';
import { AppState } from 'calypso/types';

/**
 * Gets the previous route set by a ROUTE_SET action
 * @param {AppState} state - global redux state
 * @returns {string} previous route value
 */
export default function getPreviousRoute( state: AppState ): string {
	const previousPath = getPreviousPath( state );
	const previousQuery = getPreviousQuery( state );
	let query = '';

	if ( previousQuery ) {
		query = '?' + stringify( previousQuery );
	}

	return previousPath + query;
}
