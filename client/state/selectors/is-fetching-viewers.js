export default function isFetchingViewers( state, siteId ) {
	return state.viewers?.fetching[ siteId ] ?? false;
}
