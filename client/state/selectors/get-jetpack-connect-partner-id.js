/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getAuthorizationRemoteQueryData } from 'state/jetpack-connect/selectors';

/**
 * Returns the partner ID provided as part of Jetpack Connect authorization.
 *
 * @param  {Object} state Global state tree
 * @return {number}       Partner ID or 0 if none was found.
 */
export default function getJetpackConnectPartnerId( state ) {
	return parseInt( get( getAuthorizationRemoteQueryData( state ), 'partner_id', 0 ), 10 );
}
