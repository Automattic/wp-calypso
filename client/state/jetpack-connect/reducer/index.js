import { combineReducers } from 'calypso/state/utils';
import jetpackAuthAttempts from './jetpack-auth-attempts';
import jetpackConnectAuthorize from './jetpack-connect-authorize';
import jetpackConnectSite from './jetpack-connect-site';
import jetpackSSO from './jetpack-sso';

export default combineReducers( {
	jetpackConnectSite,
	jetpackSSO,
	jetpackConnectAuthorize,
	jetpackAuthAttempts,
} );
