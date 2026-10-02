export default function getSiteFeaturesError( state, siteId ) {
	return state.sites.features?.[ siteId ]?.error ?? null;
}
