/**
 * Internal dependencies
 */
import { CONVERT_TO_BLOCKS_DIALOG_DISMISS } from 'state/action-types';

export function dismissConvertToBlocksDialog( siteId, postId ) {
	return {
		type: CONVERT_TO_BLOCKS_DIALOG_DISMISS,
		siteId,
		postId,
	};
}
