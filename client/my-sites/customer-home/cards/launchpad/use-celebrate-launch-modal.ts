import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useState } from 'react';

export function useCelebrateLaunchModal( siteId: number ) {
	const [ isOpen, setIsOpen ] = useState( false );

	const setModalIsOpen = ( isOpen: boolean ) => {
		setIsOpen( isOpen );
	};

	const handleSiteLaunched = ( isWpcomAtomic: boolean ) => {
		// currently the action to update site_launch status on atomic doesn't fire
		// this is a workaround until that is fixed
	};

	return {
		isOpen,
		setModalIsOpen,
		handleSiteLaunched,
	};
}
