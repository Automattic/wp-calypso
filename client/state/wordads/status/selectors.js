import 'calypso/state/wordads/init';

export function isSiteWordadsUnsafe( state, siteId ) {
	return state?.wordads?.status?.[ siteId ]?.unsafe ?? false;
}
