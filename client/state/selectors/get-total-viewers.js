export default function getDefaultViewers( state, siteId ) {
	return state.viewers?.queries[ siteId ]?.found ?? 0;
}
