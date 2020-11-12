/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { MenuItem } from '@wordpress/components';
import { _x } from '@wordpress/i18n';
import { switchToBlockType } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { BlockSettingsMenuControls } from '@wordpress/block-editor';

export function ConvertToGroupButton( {
	onConvertToGroup,
	onConvertFromGroup,
	isGroupable = false,
	isUngroupable = false,
} ) {
	if ( ! isGroupable && ! isUngroupable ) {
		return null;
	}

	return (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<>
					{ isGroupable && (
						<MenuItem
							onClick={ () => {
								onConvertToGroup();
								onClose();
							} }
						>
							{ _x( 'Group', 'verb' ) }
						</MenuItem>
					) }
					{ isUngroupable && (
						<MenuItem
							onClick={ () => {
								onConvertFromGroup();
								onClose();
							} }
						>
							{ _x(
								'Ungroup',
								'Ungrouping blocks from within a Group block back into individual blocks within the Editor '
							) }
						</MenuItem>
					) }
				</>
			) }
		</BlockSettingsMenuControls>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getBlockRootClientId,
			getBlocksByClientId,
			canInsertBlockType,
			getSelectedBlockClientIds,
		} = select( 'core/block-editor' );

		const { getGroupingBlockName } = select( 'core/blocks' );

		const clientIds = getSelectedBlockClientIds();
		const groupingBlockName = getGroupingBlockName();

		const rootClientId =
			clientIds && clientIds.length > 0 ? getBlockRootClientId( clientIds[ 0 ] ) : undefined;

		const groupingBlockAvailable = canInsertBlockType( groupingBlockName, rootClientId );

		const blocksSelection = getBlocksByClientId( clientIds );

		const isSingleGroupingBlock =
			blocksSelection.length === 1 &&
			blocksSelection[ 0 ] &&
			blocksSelection[ 0 ].name === groupingBlockName;

		// Do we have
		// 1. Grouping block available to be inserted?
		// 2. One or more blocks selected
		// (we allow single Blocks to become groups unless
		// they are a soltiary group block themselves)
		const isGroupable = groupingBlockAvailable && blocksSelection.length && ! isSingleGroupingBlock;

		// Do we have a single Group Block selected and does that group have inner blocks?
		const isUngroupable = isSingleGroupingBlock && !! blocksSelection[ 0 ].innerBlocks.length;

		return {
			clientIds,
			isGroupable,
			isUngroupable,
			blocksSelection,
			groupingBlockName,
		};
	} ),
	withDispatch( ( dispatch, { clientIds, blocksSelection = [], groupingBlockName } ) => {
		const { replaceBlocks } = dispatch( 'core/block-editor' );

		return {
			onConvertToGroup() {
				// Activate the `transform` on the Grouping Block which does the conversion
				const newBlocks = switchToBlockType( blocksSelection, groupingBlockName );

				if ( newBlocks ) {
					replaceBlocks( clientIds, newBlocks );
				}
			},
			onConvertFromGroup() {
				const innerBlocks = blocksSelection[ 0 ].innerBlocks;

				if ( ! innerBlocks.length ) {
					return;
				}

				replaceBlocks( clientIds, innerBlocks );
			},
		};
	} ),
] )( ConvertToGroupButton );
