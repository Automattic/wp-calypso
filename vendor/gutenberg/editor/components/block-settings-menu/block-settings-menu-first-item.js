/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

const { Fill: _BlockSettingsMenuFirstItem, Slot } = createSlotFill( '_BlockSettingsMenuFirstItem' );

_BlockSettingsMenuFirstItem.Slot = Slot;

export default _BlockSettingsMenuFirstItem;
