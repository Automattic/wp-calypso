import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useSort( initialKey = '', initialDirection: SortDirection = 'asc' ) {
	const [ key, setKey ] = useState( initialKey );
	const [ direction, setDirection ] = useState( initialDirection );

	function handleSortChange( nextKey: string ) {
		if ( nextKey === key ) {
			const nextDirection = direction === 'asc' ? 'desc' : 'asc';
			setDirection( nextDirection );
		} else {
			setKey( nextKey );
		}
	}

	return { key, direction, handleSortChange };
}
