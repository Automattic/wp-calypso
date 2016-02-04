/**
 * Internal dependencies
 */
import { EDITOR_MEDIA_EDIT_ITEM_SET } from 'state/action-types';

export function setEditorMediaEditItem( item ) {
	return {
		type: EDITOR_MEDIA_EDIT_ITEM_SET,
		item
	};
}
