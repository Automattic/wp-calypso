/**
 * External dependencies
 */
import { ActionCreators } from 'redux-undo';

const actions = {
	undo() {
		return ActionCreators.undo();
	},
	redo() {
		return ActionCreators.redo();
	},
	/**
	 * Update blocks without undo history
	 *
	 * @param {object[]} blocks - Blocks to update
	 * @param {object} options - Undo options
	 */
	updateBlocksWithUndo( blocks, options = {} ) {
		return {
			type: 'UPDATE_BLOCKS_WITH_UNDO',
			blocks,
			...options,
		};
	},
	/**
	 * Update blocks without undo history
	 *
	 * @param {object[]} blocks - Blocks to update
	 * @param {object} options - Options
	 */
	updateBlocksWithoutUndo( blocks, options = {} ) {
		return {
			type: 'UPDATE_BLOCKS_WITHOUT_UNDO',
			blocks,
			...options,
		};
	},
};

export default actions;
