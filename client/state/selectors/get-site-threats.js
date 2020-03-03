export default function getSiteThreats( state, siteId ) {
	return state.rewind?.[ siteId ]?.state?.alerts?.threats ?? [];
}
