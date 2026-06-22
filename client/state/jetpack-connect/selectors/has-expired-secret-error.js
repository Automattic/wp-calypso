import { get } from 'lodash';
import { getAuthorizationData } from 'calypso/state/jetpack-connect/selectors/get-authorization-data';

import 'calypso/state/jetpack-connect/init';

/**
 * Returns true if there is an expired secret error.
 * @param  {Object}  state Global state tree
 * @returns {boolean}       True if there's an xmlrpc error otherwise false
 */
export const hasExpiredSecretError = function ( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		!! get( authorizeData, 'authorizationCode', false ) &&
		get( authorizeData, [ 'authorizeError', 'message' ], '' ).includes( 'verify_secrets_expired' )
	);
};
