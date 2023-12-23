import {
	BlockEditorProvider,
	BlockToolbar,
	BlockTools,
	BlockList,
	BlockCanvas,
	store as blockEditorStore,
	// @ts-expect-error - Typings missing
} from '@wordpress/block-editor';
import { createBlock, serialize, parse, rawHandler, type BlockInstance } from '@wordpress/blocks';
import { Popover, SlotFillProvider, KeyboardShortcuts } from '@wordpress/components';
import { useStateWithHistory, useResizeObserver } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { rawShortcut } from '@wordpress/keycodes';
import classNames from 'classnames';
import { EditorProps, StateWithUndoManager } from '../types';
import { editorSettings } from './editor-settings';
import inlineStyles from './iframe.scss?inline';
import type { MouseEvent, KeyboardEvent } from 'react';

/**
 * Convert initial content into array of block instances.
 * @param content HTML or serialized blocks.
 * @returns
 */
function parseInitialBlocks( content: string | undefined ): BlockInstance[] | undefined {
	if ( ! content ) {
		return;
	}

	// If block HTML, parse
	if ( content.indexOf( '<!--' ) !== -1 ) {
		return parse( content );
	}

	// Otherwise try to convert to block
	return rawHandler( { HTML: content } );
}

/**
 * Editor component
 */
export const Editor: React.FC< EditorProps > = ( { initialContent, onChange } ) => {
	const parsedInitialContent = parseInitialBlocks( initialContent );

	// We keep the content in state so we can access the blocks in the editor.
	const {
		value: editorContent,
		setValue: setEditorContent,
		undo,
		redo,
	} = useStateWithHistory(
		parsedInitialContent ?? [ createBlock( 'core/paragraph' ) ]
	) as unknown as StateWithUndoManager;
	const [ isEditing, setIsEditing ] = useState( false );

	const handleContentUpdate = ( content: BlockInstance[] ) => {
		setEditorContent( content );
		onChange( serialize( content ) );
	};

	// Listen for the content height changing and update the iframe height.
	const [ contentResizeListener, { height: contentHeight } ] = useResizeObserver();

	const { selectBlock } = useDispatch( blockEditorStore );

	const selectLastBlock = ( event?: MouseEvent | KeyboardEvent ) => {
		const lastBlock = editorContent[ editorContent.length - 1 ];

		// If this is a click event only shift focus if the click is in the root.
		// We don't want to shift focus if the click is in a block.
		if ( event ) {
			if ( ( event.target as HTMLDivElement ).dataset.isDropZone ) {
				// If the last block isn't a paragraph, add a new one.
				// This allows the user to add text after a non-text block without clicking the inserter.
				if ( lastBlock.name !== 'core/paragraph' ) {
					const newParagraph = createBlock( 'core/paragraph' );
					handleContentUpdate( [ ...editorContent, newParagraph ] );
					selectBlock( newParagraph.clientId );
				}

				selectBlock( lastBlock.clientId );
			} else {
				return;
			}
		}

		selectBlock( lastBlock.clientId );
	};

	useEffect( () => {
		// Select the first item in the editor when it loads.
		selectLastBlock();
		setIsEditing( true );
	}, [] );

	return (
		<SlotFillProvider>
			<KeyboardShortcuts
				bindGlobal={ false }
				shortcuts={ {
					[ rawShortcut.primary( 'z' ) ]: undo,
					[ rawShortcut.primaryShift( 'z' ) ]: redo,
				} }
			>
				<BlockEditorProvider
					settings={ editorSettings }
					value={ editorContent }
					useSubRegistry={ false }
					onInput={ handleContentUpdate }
					onChange={ handleContentUpdate }
				>
					<div className={ classNames( 'editor__header', { 'is-editing': isEditing } ) }>
						<div className="editor__header-wrapper">
							<div className="editor__header-toolbar">
								<BlockToolbar hideDragHandle />
							</div>
							{ /* @ts-expect-error - Slot type missing */ }
							<Popover.Slot />
						</div>
					</div>
					<div className="editor__main">
						{ /* @ts-expect-error - Slot type missing */ }
						<Popover.Slot />
						<BlockTools>
							<BlockCanvas styles={ [ { css: inlineStyles } ] } height={ contentHeight }>
								{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */ }
								<div className="editor__block-canvas-container" onClick={ selectLastBlock }>
									{ contentResizeListener }
									<BlockList renderAppender={ false } />
								</div>
							</BlockCanvas>
						</BlockTools>
					</div>
				</BlockEditorProvider>
			</KeyboardShortcuts>
		</SlotFillProvider>
	);
};
