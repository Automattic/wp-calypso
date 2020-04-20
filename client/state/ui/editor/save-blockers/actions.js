/**
 * Internal dependencies
 */
import { EDITOR_SAVE_BLOCK, EDITOR_SAVE_UNBLOCK } from 'state/action-types';

export const blockSave = ( key ) => ( {
	type: EDITOR_SAVE_BLOCK,
	key,
} );

export const unblockSave = ( key ) => ( {
	type: EDITOR_SAVE_UNBLOCK,
	key,
} );
