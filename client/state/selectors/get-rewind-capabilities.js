export default function getRewindCapabilities( state, siteId ) {
	return state?.rewind?.[ siteId ]?.capabilities;
}
