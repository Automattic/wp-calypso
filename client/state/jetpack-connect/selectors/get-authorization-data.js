import 'calypso/state/jetpack-connect/init';

export const getAuthorizationData = ( state ) => {
	return state?.jetpackConnect?.jetpackConnectAuthorize;
};
