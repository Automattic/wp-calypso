import { usePrevious } from '@wordpress/compose';
import { useEffect, useRef } from 'react';
import type { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

// DataViews' pagination always resets when the search component is mounted, even though the search term has not changed.
// This is a bug which has a fix in https://github.com/WordPress/gutenberg/pull/61307.
// This is a workaround until the above fix is released.
// Here, we restore the page to the previous page if it is unintentionally changed by the above bug.
export function useInitializeDataViewsPage(
	dataViewsState: DataViewsState,
	setDataViewsState: ( state: DataViewsState ) => void
) {
	const prevPage = usePrevious( dataViewsState.page ) as number;
	const prevSearch = usePrevious( dataViewsState.search ) as string;

	const done = useRef( false );

	useEffect( () => {
		if ( prevPage === 1 ) {
			done.current = true;
		}
		if ( done.current ) {
			return;
		}

		if ( dataViewsState.search === prevSearch && dataViewsState.page !== prevPage ) {
			setDataViewsState( {
				...dataViewsState,
				page: prevPage,
			} );
			done.current = true;
		}
	}, [ dataViewsState.page, dataViewsState.search ] );
}
