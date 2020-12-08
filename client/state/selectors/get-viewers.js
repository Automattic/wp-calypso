const DEFAULT_VIEWERS = [];

export default function getViewers( state, siteId ) {
	return (
		state.viewers?.queries[ siteId ]?.ids.map( ( id ) => state.viewers?.items[ id ] ) ??
		DEFAULT_VIEWERS
	);
}
