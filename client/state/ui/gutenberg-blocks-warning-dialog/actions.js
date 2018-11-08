/** @format */

/**
 * Internal dependencies
 */
import { GUTENBERG_BLOCKS_WARNING_DIALOG_IS_SHOWING } from 'state/action-types';

export function showGutenbergBlocksWarningDialog() {
	return {
		type: GUTENBERG_BLOCKS_WARNING_DIALOG_IS_SHOWING,
		isShowing: true,
	};
}

export function hideGutenbergBlocksWarningDialog() {
	return {
		type: GUTENBERG_BLOCKS_WARNING_DIALOG_IS_SHOWING,
		isShowing: false,
	};
}
