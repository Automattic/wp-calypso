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
 * Returns true if there is an XMLRPC error.
 *
 * XMLRPC errors can be identified by the presence of an error message, the presence of an
 * authorization code, and if the error message contains the string 'error'.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       True if there's an xmlrpc error otherwise false
 */
export const hasXmlrpcError = function ( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		!! get( authorizeData, 'authorizationCode', false ) &&
		includes( get( authorizeData, [ 'authorizeError', 'message' ] ), 'error' )
	);
};
