/**
 * Internal dependencies
 */

import getCurrentRoute from 'state/selectors/get-current-route';

/**
 * Returns true if the current route is the status page of an active migration.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if route is an active migration route
 */
export default function isSiteMigrationActiveRoute( state ) {
	const route = getCurrentRoute( state );

	if ( ! route ) {
		return false;
	}

	return route.match( /\/migrate\/(upgrade\/)?from\/[^/]+\/to\// );
}
