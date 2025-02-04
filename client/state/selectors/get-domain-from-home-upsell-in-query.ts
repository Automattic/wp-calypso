import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Returns the get_domain query param if present or null.
 * @param {Object}   state Global state tree
 * @returns {?string}       The domain as a string or null
 */
export const getDomainFromHomeUpsellInQuery = function ( state: AppState ): string | null {
	const queryArgs = getCurrentQueryArguments( state );
	const domain = queryArgs?.get_domain;
	return domain ? domain.toString() : null;
};

export default getDomainFromHomeUpsellInQuery;
