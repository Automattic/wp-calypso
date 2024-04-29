import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import type { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

export function useSyncSelectedSite( dataViewsState: DataViewsState ) {
	const dispatch = useDispatch();

	// Update selected site globally as soon as it is clicked from the table.
	useEffect( () => {
		dispatch( setSelectedSiteId( dataViewsState.selectedItem?.ID ) );
	}, [ dispatch, dataViewsState.selectedItem ] );
}
