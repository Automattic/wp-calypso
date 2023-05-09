import 'calypso/state/jetpack/init';

export function areJetpackCredentialsInvalid( state, siteId, role ) {
	return 'invalid' === state.jetpack.credentials.testStatus[ siteId ]?.[ role ];
}

export function isRequestingJetpackCredentialsTest( state, siteId, role ) {
	return state.jetpack.credentials.testRequestStatus[ siteId ]?.[ role ] || false;
}
