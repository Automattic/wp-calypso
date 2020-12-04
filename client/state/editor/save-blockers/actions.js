/**
 * Internal dependencies
 */
import { EDITOR_SAVE_BLOCK, EDITOR_SAVE_UNBLOCK } from 'calypso/state/action-types';

import 'calypso/state/editor/init';

export const blockSave = ( key ) => ( {
	type: EDITOR_SAVE_BLOCK,
	key,
} );

export const unblockSave = ( key ) => ( {
	type: EDITOR_SAVE_UNBLOCK,
	key,
} );
