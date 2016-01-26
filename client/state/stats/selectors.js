import { getCompositeKey, normalizeParams } from './utils';

export function getStatsItem( state, params ) {
	const _params = normalizeParams( params );
	const key = getCompositeKey( _params );
	return ( key && state.stats.items[key] )
		? state.stats.items[key]
		: {};
}

export function isStatsItemFetching( state, params ) {
	const _params = normalizeParams( params );
	const key = getCompositeKey( _params );
	return !! state.stats.fetchingItems[key];
}
