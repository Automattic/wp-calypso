import 'calypso/state/jetpack-connect/init';

export const getConnectingSite = ( state ) => {
	return state?.jetpackConnect?.jetpackConnectSite;
};
