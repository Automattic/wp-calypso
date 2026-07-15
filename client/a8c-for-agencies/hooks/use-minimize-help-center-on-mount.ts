import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
	useRegistry,
} from '@wordpress/data';
import { useCallback, useEffect, useRef } from 'react';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * Hook that returns an imperative callback to minimize the Help Center.
 * Reads the live Help Center state at call time, so it stays correct when
 * invoked from an event or effect after render (unlike a value captured in a
 * dependency array). Useful for hosts that need to minimize the Help Center
 * when a modal opens.
 */
export function useMinimizeHelpCenter() {
	const registry = useRegistry();
	const { setIsMinimized } = useDataStoreDispatch( HELP_CENTER_STORE );

	return useCallback( () => {
		const store = registry.select( HELP_CENTER_STORE ) as HelpCenterSelect;
		if ( store.isHelpCenterShown() && ! store.getIsMinimized() ) {
			setIsMinimized( true );
		}
	}, [ registry, setIsMinimized ] );
}

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
