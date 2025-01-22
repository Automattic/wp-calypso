import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

export function useCelebrateLaunchModal( siteId: number, layout: { refetch: () => void } | null ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const dispatch = useDispatch();

	const setModalIsOpen = ( isOpen: boolean ) => {
		setIsOpen( isOpen );

		if ( isOpen ) {
			// Site launched, update site data
			dispatch( requestSite( siteId ) );
		} else {
			// Modal closed, update the launchpad data/checklist
			layout?.refetch();
		}
	};

	const handleSiteLaunched = ( isWpcomAtomic: boolean ) => {
		setModalIsOpen( true );
		// currently the action to update site_launch status on atomic doesn't fire
		// this is a workaround until that is fixed
		if ( isWpcomAtomic ) {
			updateLaunchpadSettings( siteId, {
				checklist_statuses: { site_launched: true },
			} );
		}
	};

	return {
		isOpen,
		setModalIsOpen,
		handleSiteLaunched,
	};
}
