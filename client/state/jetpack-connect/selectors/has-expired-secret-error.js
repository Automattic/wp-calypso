/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getAuthorizationData } from 'state/jetpack-connect/selectors/get-authorization-data';

import 'state/jetpack-connect/init';

/**
 * Returns true if there is an expired secret error.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       True if there's an xmlrpc error otherwise false
 */
export const hasExpiredSecretError = function ( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		!! get( authorizeData, 'authorizationCode', false ) &&
		includes( get( authorizeData, [ 'authorizeError', 'message' ] ), 'verify_secrets_expired' )
	);
};
