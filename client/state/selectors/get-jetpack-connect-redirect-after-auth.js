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
 * Returns redirect_after_auth provided as part of Jetpack Connect authorization.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Redirect URL
 */
export default function getJetpackConnectRedirectAfterAuth( state ) {
	return get( getAuthorizationRemoteQueryData( state ), 'redirect_after_auth', null );
}
