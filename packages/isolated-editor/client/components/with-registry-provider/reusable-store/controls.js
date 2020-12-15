/**
 * WordPress dependencies
 */
import { isReusableBlock, createBlock, parse, serialize } from '@wordpress/blocks';
import { createRegistryControl } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Convert a reusable block to a static block effect handler
 *
 * @param {string}  clientId Block ID.
 * @return {Object} control descriptor.
 */
export function convertBlockToStatic( clientId ) {
	return {
		type: 'CONVERT_BLOCK_TO_STATIC',
		clientId,
	};
}

/**
 * Convert a static block to a reusable block effect handler
 *
 * @param {Array}  clientIds Block IDs.
 * @return {Object} control descriptor.
 */
export function convertBlocksToReusable( clientIds ) {
	return {
		type: 'CONVERT_BLOCKS_TO_REUSABLE',
		clientIds,
	};
}

/**
 * Deletes a reusable block.
 *
 * @param {string} id Reusable block ID.
 * @return {Object} control descriptor.
 */
export function deleteReusableBlock( id ) {
	return {
		type: 'DELETE_REUSABLE_BLOCK',
		id,
	};
}

const controls = {
	CONVERT_BLOCK_TO_STATIC: createRegistryControl( ( registry ) => ( { clientId } ) => {
		const oldBlock = registry.select( 'core/block-editor' ).getBlock( clientId );
		const reusableBlock = registry
			.select( 'core' )
			.getEditedEntityRecord( 'postType', 'wp_block', oldBlock.attributes.ref );

		const newBlocks = parse( reusableBlock.content );
		registry.dispatch( 'core/block-editor' ).replaceBlocks( oldBlock.clientId, newBlocks );
	} ),

	CONVERT_BLOCKS_TO_REUSABLE: createRegistryControl(
		( registry ) =>
			async function ( { clientIds } ) {
				const reusableBlock = {
					title: __( 'Untitled Reusable Block' ),
					content: serialize(
						registry.select( 'core/block-editor' ).getBlocksByClientId( clientIds )
					),
					status: 'publish',
				};

				const updatedRecord = await registry
					.dispatch( 'core' )
					.saveEntityRecord( 'postType', 'wp_block', reusableBlock );

				const newBlock = createBlock( 'core/block', {
					ref: updatedRecord.id,
				} );
				registry.dispatch( 'core/block-editor' ).replaceBlocks( clientIds, newBlock );
				registry
					.dispatch( 'core/reusable-blocks' )
					.__experimentalSetEditingReusableBlock( newBlock.clientId, true );
			}
	),

	DELETE_REUSABLE_BLOCK: createRegistryControl(
		( registry ) =>
			async function ( { id } ) {
				const reusableBlock = registry
					.select( 'core' )
					.getEditedEntityRecord( 'postType', 'wp_block', id );

				// Don't allow a reusable block with a temporary ID to be deleted
				if ( ! reusableBlock ) {
					return;
				}

				// Remove any other blocks that reference this reusable block
				const allBlocks = registry.select( 'core/block-editor' ).getBlocks();
				const associatedBlocks = allBlocks.filter(
					( block ) => isReusableBlock( block ) && block.attributes.ref === id
				);
				const associatedBlockClientIds = associatedBlocks.map( ( block ) => block.clientId );

				// Remove the parsed block.
				if ( associatedBlockClientIds.length ) {
					registry.dispatch( 'core/block-editor' ).removeBlocks( associatedBlockClientIds );
				}

				await registry.dispatch( 'core' ).deleteEntityRecord( 'postType', 'wp_block', id );
			}
	),
};

export default controls;
