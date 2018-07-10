/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ifBlockEditSelected } from '../block-edit/context';

const { Fill, Slot } = createSlotFill( 'BlockFormatControls' );

const BlockFormatControls = ifBlockEditSelected( Fill );

BlockFormatControls.Slot = Slot;

export default BlockFormatControls;
