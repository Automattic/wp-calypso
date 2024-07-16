import { SiteDetails } from '@automattic/data-stores';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import type { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

export function useSyncSelectedSite(
	dataViewsState: DataViewsState,
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void,
	selectedSite: SiteDetails | null | undefined
) {
	const dispatch = useDispatch();
	const isInitialLoad = useRef( true );

	// Update selected site globally as soon as it is clicked from the table.
	useEffect( () => {
		if ( isInitialLoad.current && ! dataViewsState.selectedItem ) {
			isInitialLoad.current = false;
			return;
		}
		isInitialLoad.current = false;
		dispatch( setSelectedSiteId( dataViewsState.selectedItem?.ID ) );
	}, [ dispatch, dataViewsState.selectedItem ] );

	// If calypso state changes the selected site, ensure the dataViewsState is updated as well.
	useEffect( () => {
		setDataViewsState( ( prevState ) => ( { ...prevState, selectedItem: selectedSite } ) );
	}, [ selectedSite, setDataViewsState ] );
}
