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
 * Returns Jetpack plugin version provided as part of Jetpack Connect authorization.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Version string
 */
export default function getJetpackConnectJetpackVersion( state ) {
	return get( getAuthorizationRemoteQueryData( state ), 'jp_version', null );
}
