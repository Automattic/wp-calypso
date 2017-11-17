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
 * Returns from information provided as part of Jetpack Connect authorization.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       From string
 */
export default function getJetpackConnectFrom( state ) {
	return get( getAuthorizationRemoteQueryData( state ), 'from', null );
}
