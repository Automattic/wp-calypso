import 'calypso/state/jetpack/init';

export function getAreJetpackCredentialsInvalid( state, siteId, role ) {
	return 'invalid' === state.jetpack.credentials.testRequestStatus[ siteId ]?.[ role ];
}
