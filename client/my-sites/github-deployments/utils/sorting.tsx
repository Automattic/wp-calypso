import { Icon } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';

type SortOption =
	| 'name_asc'
	| 'name_desc'
	| 'date_asc'
	| 'date_desc'
	| 'status_asc'
	| 'status_desc'
	| 'duration_asc'
	| 'duration_desc';

export type SortPair = [ SortOption, SortOption ];

export const nameSorts: SortPair = [ 'name_asc', 'name_desc' ];
export const dateSorts: SortPair = [ 'date_asc', 'date_desc' ];
export const statusSorts: SortPair = [ 'status_asc', 'status_desc' ];
export const durationSorts: SortPair = [ 'duration_asc', 'duration_desc' ];

export function getSortIcon( sortKey: SortOption, pair: SortPair ) {
	if ( sortKey === pair[ 0 ] ) {
		return <Icon size={ 16 } icon={ chevronDown } />;
	} else if ( sortKey === pair[ 1 ] ) {
		return <Icon size={ 16 } icon={ chevronUp } />;
	}
}

export function flipSortPair( sortKey: SortOption, pair: SortPair ) {
	if ( sortKey === pair[ 0 ] ) {
		return pair[ 1 ];
	}
	return pair[ 0 ];
}
