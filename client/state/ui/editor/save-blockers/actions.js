/** @format */

/**
 * Internal dependencies
 */
import { EDITOR_SAVE_BLOCK, EDITOR_SAVE_UNBLOCK, EDITOR_SAVE_RESET } from 'state/action-types';

export const blockSave = key => ( {
	type: EDITOR_SAVE_BLOCK,
	key,
} );

export const unblockSave = key => ( {
	type: EDITOR_SAVE_UNBLOCK,
	key,
} );

// TODO: merge this action into EDITOR_START, EDITOR_STOP etc. when they are ready
export const resetSaveBlockers = () => ( {
	type: EDITOR_SAVE_RESET,
} );
