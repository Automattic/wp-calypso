import { DEFAULT_PAGE_SIZE } from './constants';

// The Marketplace search API accepts starting offsets up to and including 200.
const MAX_SEARCH_OFFSET = 200;

export const getLastSearchPage = ( pageSize = DEFAULT_PAGE_SIZE ) =>
	Math.floor( MAX_SEARCH_OFFSET / pageSize ) + 1;

export function getPluginsPage( value: unknown, lastPage = Infinity ): number {
	if ( typeof value !== 'number' && typeof value !== 'string' ) {
		return 1;
	}
	if ( ! /^[1-9]\d*$/.test( String( value ) ) ) {
		return 1;
	}
	const page = Number( value );
	return Number.isSafeInteger( page ) && page <= lastPage ? page : 1;
}
