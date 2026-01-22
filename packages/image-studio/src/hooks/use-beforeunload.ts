import { select } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { store as imageStudioStore } from '../store';

/**
 * Hook to show browser confirmation dialog when closing with unsaved changes
 * Reads state directly from Redux store to avoid closure issues with page reloads
 */
export const useBeforeUnload = (): void => {
	useEffect( () => {
		const handleBeforeUnload = ( e: BeforeUnloadEvent ) => {
			// Read current state directly from Redux store (no closure issues)
			const selectors = select( imageStudioStore );
			const hasUnsavedChanges = selectors.getHasUnsavedChanges();
			const isExitConfirmed = selectors.getIsExitConfirmed();

			// Only block if there are unsaved changes AND user hasn't already confirmed exit
			if ( hasUnsavedChanges && ! isExitConfirmed ) {
				e.preventDefault();
				e.returnValue = ''; // Chrome requires this
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [] );
};
