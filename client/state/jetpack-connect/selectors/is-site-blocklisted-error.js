/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getAuthorizationData } from 'state/jetpack-connect/selectors/get-authorization-data';

import 'state/jetpack-connect/init';

/**
 * Returns true if the authorization error indicates that site has been blocklisted.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       True if there's a blocklisted site error, false otherwise
 */
export const isSiteBlocklistedError = function ( state ) {
	const authorizeData = getAuthorizationData( state );

	return get( authorizeData, [ 'authorizeError', 'error' ] ) === 'site_blacklisted';
};
