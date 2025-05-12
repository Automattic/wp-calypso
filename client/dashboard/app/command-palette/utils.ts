// @ts-expect-error The commands package is not yet typed.
import { store as commandsStore } from '@wordpress/commands';
import { useDispatch } from '@wordpress/data';

/**
 * Utility function to open the command palette directly from anywhere
 */
export function useOpenCommandPalette() {
	const { open } = useDispatch( commandsStore );
	return open;
}
