/**
 * Internal dependencies
 */
import { convertBlockToStatic, convertBlocksToReusable, deleteReusableBlock } from './controls';

/**
 * Returns a generator converting a reusable block into a static block.
 *
 * @param {string} clientId The client ID of the block to attach.
 */
export function* __experimentalConvertBlockToStatic( clientId ) {
	yield convertBlockToStatic( clientId );
}

/**
 * Returns a generator converting one or more static blocks into a reusable block.
 *
 * @param {string[]} clientIds The client IDs of the block to detach.
 */
export function* __experimentalConvertBlocksToReusable( clientIds ) {
	yield convertBlocksToReusable( clientIds );
}

/**
 * Returns a generator deleting a reusable block.
 *
 * @param {string} id The ID of the reusable block to delete.
 */
export function* __experimentalDeleteReusableBlock( id ) {
	yield deleteReusableBlock( id );
}

/**
 * Returns an action descriptor for SET_EDITING_REUSABLE_BLOCK action.
 *
 * @param {string} clientId The clientID of the reusable block to target.
 * @param {boolean} isEditing Whether the block should be in editing state.
 * @returns {Object} Action descriptor.
 */
export function __experimentalSetEditingReusableBlock( clientId, isEditing ) {
	return {
		type: 'SET_EDITING_REUSABLE_BLOCK',
		clientId,
		isEditing,
	};
}
