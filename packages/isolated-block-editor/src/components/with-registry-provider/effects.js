/**
 * External dependencies
 */
import { findKey } from 'lodash';

/**
 * WordPress dependencies
 */
import { speak } from '@wordpress/a11y';
import {
	getBlockType,
	doBlocksMatchTemplate,
	switchToBlockType,
	synchronizeBlocksWithTemplate,
	cloneBlock,
} from '@wordpress/blocks';
import { _n, sprintf } from '@wordpress/i18n';
import { create, toHTMLString, insert, remove } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import { storeConfig as blockEditorStoreConfig } from '@wordpress/block-editor';
const {
	replaceBlocks,
	selectBlock,
	setTemplateValidity,
	resetBlocks,
	selectionChange,
} = blockEditorStoreConfig.actions;
const {
	getBlock,
	getBlocks,
	getSelectedBlockCount,
	getTemplateLock,
	getTemplate,
	isValidTemplate,
	getSelectionStart,
} = blockEditorStoreConfig.selectors;

/**
 * Block validity is a function of blocks state (at the point of a
 * reset) and the template setting. As a compromise to its placement
 * across distinct parts of state, it is implemented here as a side-
 * effect of the block reset action.
 *
 * @param {Object} action RESET_BLOCKS action.
 * @param {Object} store  Store instance.
 *
 * @returns {?Object} New validity set action if validity has changed.
 */
export function validateBlocksToTemplate( action, store ) {
	const state = store.getState();
	const template = getTemplate( state );
	const templateLock = getTemplateLock( state );

	// Unlocked templates are considered always valid because they act
	// as default values only.
	const isBlocksValidToTemplate =
		! template || templateLock !== 'all' || doBlocksMatchTemplate( action.blocks, template );

	// Update if validity has changed.
	if ( isBlocksValidToTemplate !== isValidTemplate( state ) ) {
		return setTemplateValidity( isBlocksValidToTemplate );
	}
}

export default {
	MERGE_BLOCKS( action, store ) {
		const { dispatch } = store;
		const state = store.getState();
		const [ clientIdA, clientIdB ] = action.blocks;
		const blockA = getBlock( state, clientIdA );
		const blockAType = getBlockType( blockA.name );

		// Only focus the previous block if it's not mergeable
		if ( ! blockAType.merge ) {
			dispatch( selectBlock( blockA.clientId ) );
			return;
		}

		const blockB = getBlock( state, clientIdB );
		const blockBType = getBlockType( blockB.name );
		const { clientId, attributeKey, offset } = getSelectionStart( state );
		const selectedBlockType = clientId === clientIdA ? blockAType : blockBType;
		const attributeDefinition = selectedBlockType.attributes[ attributeKey ];
		const canRestoreTextSelection =
			( clientId === clientIdA || clientId === clientIdB ) &&
			attributeKey !== undefined &&
			offset !== undefined &&
			// We cannot restore text selection if the RichText identifier
			// is not a defined block attribute key. This can be the case if the
			// fallback intance ID is used to store selection (and no RichText
			// identifier is set), or when the identifier is wrong.
			!! attributeDefinition;

		if ( ! attributeDefinition ) {
			if ( typeof attributeKey === 'number' ) {
				window.console.error(
					`RichText needs an identifier prop that is the block attribute key of the attribute it controls. Its type is expected to be a string, but was ${ typeof attributeKey }`
				);
			} else {
				window.console.error(
					'The RichText identifier prop does not match any attributes defined by the block.'
				);
			}
		}

		// A robust way to retain selection position through various transforms
		// is to insert a special character at the position and then recover it.
		const START_OF_SELECTED_AREA = '\u0086';

		// Clone the blocks so we don't insert the character in a "live" block.
		const cloneA = cloneBlock( blockA );
		const cloneB = cloneBlock( blockB );

		if ( canRestoreTextSelection ) {
			const selectedBlock = clientId === clientIdA ? cloneA : cloneB;
			const html = selectedBlock.attributes[ attributeKey ];
			const {
				multiline: multilineTag,
				__unstableMultilineWrapperTags: multilineWrapperTags,
				__unstablePreserveWhiteSpace: preserveWhiteSpace,
			} = attributeDefinition;
			const value = insert(
				create( {
					html,
					multilineTag,
					multilineWrapperTags,
					preserveWhiteSpace,
				} ),
				START_OF_SELECTED_AREA,
				offset,
				offset
			);

			selectedBlock.attributes[ attributeKey ] = toHTMLString( {
				value,
				multilineTag,
				preserveWhiteSpace,
			} );
		}

		// We can only merge blocks with similar types
		// thus, we transform the block to merge first
		const blocksWithTheSameType =
			blockA.name === blockB.name ? [ cloneB ] : switchToBlockType( cloneB, blockA.name );

		// If the block types can not match, do nothing
		if ( ! blocksWithTheSameType || ! blocksWithTheSameType.length ) {
			return;
		}

		// Calling the merge to update the attributes and remove the block to be merged
		const updatedAttributes = blockAType.merge(
			cloneA.attributes,
			blocksWithTheSameType[ 0 ].attributes
		);

		if ( canRestoreTextSelection ) {
			const newAttributeKey = findKey(
				updatedAttributes,
				( v ) => typeof v === 'string' && v.indexOf( START_OF_SELECTED_AREA ) !== -1
			);
			const convertedHtml = updatedAttributes[ newAttributeKey ];
			const {
				multiline: multilineTag,
				__unstableMultilineWrapperTags: multilineWrapperTags,
				__unstablePreserveWhiteSpace: preserveWhiteSpace,
			} = blockAType.attributes[ newAttributeKey ];
			const convertedValue = create( {
				html: convertedHtml,
				multilineTag,
				multilineWrapperTags,
				preserveWhiteSpace,
			} );
			const newOffset = convertedValue.text.indexOf( START_OF_SELECTED_AREA );
			const newValue = remove( convertedValue, newOffset, newOffset + 1 );
			const newHtml = toHTMLString( {
				value: newValue,
				multilineTag,
				preserveWhiteSpace,
			} );

			updatedAttributes[ newAttributeKey ] = newHtml;

			dispatch( selectionChange( blockA.clientId, newAttributeKey, newOffset, newOffset ) );
		}

		dispatch(
			replaceBlocks(
				[ blockA.clientId, blockB.clientId ],
				[
					{
						...blockA,
						attributes: {
							...blockA.attributes,
							...updatedAttributes,
						},
					},
					...blocksWithTheSameType.slice( 1 ),
				]
			)
		);
	},
	RESET_BLOCKS: [ validateBlocksToTemplate ],
	MULTI_SELECT: ( action, { getState } ) => {
		const blockCount = getSelectedBlockCount( getState() );

		speak(
			sprintf(
				/* translators: %s: number of selected blocks */
				_n( '%s block selected.', '%s blocks selected.', blockCount ),
				blockCount
			),
			'assertive'
		);
	},
	SYNCHRONIZE_TEMPLATE( action, { getState } ) {
		const state = getState();
		const blocks = getBlocks( state );
		const template = getTemplate( state );
		const updatedBlockList = synchronizeBlocksWithTemplate( blocks, template );

		return resetBlocks( updatedBlockList );
	},
	MARK_AUTOMATIC_CHANGE( action, store ) {
		const {
			setTimeout,
			requestIdleCallback = ( callback ) => setTimeout( callback, 100 ),
		} = window;

		requestIdleCallback( () => {
			store.dispatch( { type: 'MARK_AUTOMATIC_CHANGE_FINAL' } );
		} );
	},
};
