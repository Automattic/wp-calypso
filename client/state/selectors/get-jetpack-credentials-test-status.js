import 'calypso/state/jetpack/init';

export default function getJetpackCredentialsTestStatus( state, siteId, role ) {
	return state.jetpack.credentials.testRequestStatus[ siteId ]?.[ role ] || 'pending';
}
