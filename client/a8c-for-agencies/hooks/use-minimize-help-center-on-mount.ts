import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { useEffect, useRef } from 'react';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * Hook to minimize the Help Center when the component mounts.
 * Useful for modals and dialogs to prevent UI overlap.
 */
export default function useMinimizeHelpCenterOnMount() {
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { setIsMinimized } = useDataStoreDispatch( HELP_CENTER_STORE );
	const hasMinimizedRef = useRef( false );

	useEffect( () => {
		// Only minimize if Help Center is shown and not already minimized
		if ( show && ! isMinimized && ! hasMinimizedRef.current ) {
			hasMinimizedRef.current = true;
			setIsMinimized( true );
		}
	}, [ show, isMinimized, setIsMinimized ] );
}
