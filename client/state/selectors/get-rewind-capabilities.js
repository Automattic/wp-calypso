/**
 * Internal dependencies
 */
import 'calypso/state/rewind/init';

export default function getRewindCapabilities( state, siteId ) {
	return state?.rewind?.[ siteId ]?.capabilities;
}
