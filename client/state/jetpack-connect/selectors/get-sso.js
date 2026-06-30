import 'calypso/state/jetpack-connect/init';

export const getSSO = ( state ) => {
	return state?.jetpackConnect?.jetpackSSO;
};
