/** @format */
/**
 * Internal dependencies
 */
import jetpackAuthAttempts from './jetpack-auth-attempts';
import jetpackConnectAuthorize from './jetpack-connect-authorize';
import jetpackConnectSessions from './jetpack-connect-sessions';
import jetpackConnectSite from './jetpack-connect-site';
import jetpackSSO from './jetpack-sso';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	jetpackConnectSite,
	jetpackSSO,
	jetpackConnectAuthorize,
	jetpackConnectSessions,
	jetpackAuthAttempts,
} );
