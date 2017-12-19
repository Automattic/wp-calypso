/** @format */

/**
 * Internal dependencies
 */
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'state/selectors/get-initial-query-arguments';

/**
 * Gets the last redirect_to query parameter set, or if none is available the one that was set when loading the page.
 *
 * @param {Object} state - global redux state
 * @return {String?} the redirect_to url
 */
export const getRedirectToFromQueryArguments = state => {
	const { redirect_to: redirectTo } = getCurrentQueryArguments( state );

	if ( redirectTo ) {
		return redirectTo;
	}

	return getInitialQueryArguments( state ).redirect_to;
};

export default getRedirectToFromQueryArguments;
