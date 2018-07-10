/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockIcon from '../block-icon';

/**
 * Get the UID of the parent where a newly inserted block would be placed.
 *
 * @return {string} The UID of the parent where a newly inserted block would be placed.
 */
function defaultGetBlockInsertionParentUID() {
	return select( 'core/editor' ).getBlockInsertionPoint().rootUID;
}

/**
 * Get the inserter items for the specified parent block.
 *
 * @param {string} parentUID The UID of the block for which to retrieve inserter items.
 *
 * @return {Array<Editor.InserterItem>} The inserter items for the specified parent.
 */
function defaultGetInserterItems( parentUID ) {
	return select( 'core/editor' ).getInserterItems( parentUID );
}

/**
 * Get the name of the currently selected block.
 *
 * @return {string?} The name of the currently selected block or `null` if no block is selected.
 */
function defaultGetSelectedBlockName() {
	const selectedBlock = select( 'core/editor' ).getSelectedBlock();
	return selectedBlock ? selectedBlock.name : null;
}

/**
 * Creates a blocks repeater for replacing the current block with a selected block type.
 *
 * @return {Completer} A blocks completer.
 */
export function createBlockCompleter( {
	// Allow store-based selectors to be overridden for unit test.
	getBlockInsertionParentUID = defaultGetBlockInsertionParentUID,
	getInserterItems = defaultGetInserterItems,
	getSelectedBlockName = defaultGetSelectedBlockName,
} = {} ) {
	return {
		name: 'blocks',
		className: 'editor-autocompleters__block',
		triggerPrefix: '/',
		options() {
			const selectedBlockName = getSelectedBlockName();
			return getInserterItems( getBlockInsertionParentUID() ).filter(
				// Avoid offering to replace the current block with a block of the same type.
				( inserterItem ) => selectedBlockName !== inserterItem.name
			);
		},
		getOptionKeywords( inserterItem ) {
			const { title, keywords = [] } = inserterItem;
			return [ ...keywords, title ];
		},
		getOptionLabel( inserterItem ) {
			const { icon, title } = inserterItem;
			return [
				<BlockIcon key="icon" icon={ icon && icon.src } />,
				title,
			];
		},
		allowContext( before, after ) {
			return ! ( /\S/.test( before.toString() ) || /\S/.test( after.toString() ) );
		},
		getOptionCompletion( inserterItem ) {
			const { name, initialAttributes } = inserterItem;
			return {
				action: 'replace',
				value: createBlock( name, initialAttributes ),
			};
		},
		isOptionDisabled( inserterItem ) {
			return inserterItem.isDisabled;
		},
	};
}

/**
 * Creates a blocks repeater for replacing the current block with a selected block type.
 *
 * @return {Completer} A blocks completer.
 */
export default createBlockCompleter();
