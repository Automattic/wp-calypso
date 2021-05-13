/**
 * Internal dependencies
 */
import jetpackAuthAttempts from './jetpack-auth-attempts';
import jetpackConnectAuthorize from './jetpack-connect-authorize';
import jetpackConnectSite from './jetpack-connect-site';
import jetpackSSO from './jetpack-sso';
import { combineReducers } from 'calypso/state/utils';

export default combineReducers( {
	jetpackConnectSite,
	jetpackSSO,
	jetpackConnectAuthorize,
	jetpackAuthAttempts,
} );
