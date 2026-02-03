/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';

/**
 * Hook to handle save keyboard shortcut (Cmd+S / Ctrl+S)
 * @param onSave    - Callback to execute when save shortcut is triggered
 * @param isEnabled - Whether the save action is currently enabled
 */
export const useSaveShortcut = (
	onSave: () => void | Promise< void >,
	isEnabled: boolean
): void => {
	useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}

		if ( typeof document === 'undefined' ) {
			return;
		}

		const handleKeyDown = async ( e: KeyboardEvent ) => {
			if ( ( e.metaKey || e.ctrlKey ) && e.key.toLowerCase() === 's' ) {
				e.preventDefault();
				e.stopPropagation();

				try {
					await onSave();
				} catch ( error ) {
					window.console?.error?.( '[Image Studio] Save failed:', error );
				}
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );

		return () => {
			document.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ onSave, isEnabled ] );
};
