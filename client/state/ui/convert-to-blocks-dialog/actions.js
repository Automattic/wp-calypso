/**
 * Internal dependencies
 */
import { CONVERT_TO_BLOCKS_DIALOG_DISMISS } from 'state/action-types';

export const dismissConvertToBlocksDialog = ( siteId, postId ) => ( {
	type: CONVERT_TO_BLOCKS_DIALOG_DISMISS,
	siteId,
	postId,
} );
