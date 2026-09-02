import 'calypso/state/jetpack/init';

export default function getJetpackCredentialsUpdateStatus( state, siteId ) {
	return state?.jetpack?.credentials?.updateRequestStatus?.[ siteId ] ?? 'unsubmitted';
}
