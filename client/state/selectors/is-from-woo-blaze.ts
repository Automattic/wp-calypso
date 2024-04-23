import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { AppState } from 'calypso/types';

/**
 * Returns true if the query is from Woo Blaze.
 *
 * @param  {Object}   state  Global state tree
 * @returns {?boolean}        Whether query is from Woo Blaze
 */
export default function isQueryFromWooBlaze( state: AppState ) {
	const query = getInitialQueryArguments( state );
	return query?.from === 'woo-blaze';
}
