import 'calypso/state/jetpack/init';

export default function getJetpackCredentialsTestStatus( state, siteId, role ) {
	return state.jetpack.credentials.testStatus[ siteId ]?.[ role ] || 'pending';
}
