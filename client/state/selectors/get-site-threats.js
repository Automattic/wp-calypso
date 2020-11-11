/**
 * Internal dependencies
 */
import 'calypso/state/rewind/init';

export default function getSiteThreats( state, siteId ) {
	return state.rewind?.[ siteId ]?.state?.alerts?.threats ?? [];
}
