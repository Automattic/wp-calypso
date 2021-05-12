/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

export default function getJetpackCredentials( state, siteId, role ) {
	return state?.jetpack?.credentials?.items?.[ siteId ]?.[ role ] || {};
}
