export function getTransientMediaItems( state, siteId ) {
	const transientItems = state?.media?.transientItems?.[ siteId ]?.transientItems ?? {};
	return Object.values( transientItems ).reverse();
}
