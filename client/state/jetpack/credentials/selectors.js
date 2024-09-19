import 'calypso/state/jetpack/init';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';

export function areJetpackCredentialsInvalid( state, siteId, role ) {
	return 'invalid' === state.jetpack.credentials.testStatus[ siteId ]?.[ role ];
}

export function isRequestingJetpackCredentialsTest( state, siteId, role ) {
	return state.jetpack.credentials.testRequestStatus[ siteId ]?.[ role ] || false;
}

/**
 * Returns true if the site has Jetpack credentials ('main' role).
 * @param {*} state - Global state tree
 * @param {*} siteId - The site ID
 * @returns boolean - True if the site has Jetpack credentials
 */
export function hasJetpackCredentials( state, siteId ) {
	const credentials = getJetpackCredentials( state, siteId, 'main' );
	return credentials && Object.keys( credentials ).length > 0;
}
