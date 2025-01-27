import {
	BlockEditorProvider,
	BlockToolbar,
	BlockTools,
	BlockList,
	BlockCanvas,
	store as blockEditorStore,
	// @ts-expect-error - Typings missing
} from '@wordpress/block-editor';
import { getCompatibilityStyles } from '@wordpress/block-editor/build-module/components/iframe/get-compatibility-styles';
import { createBlock, serialize, type BlockInstance } from '@wordpress/blocks';
import { Popover, SlotFillProvider, KeyboardShortcuts } from '@wordpress/components';
import { useStateWithHistory, useResizeObserver } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import React, { useState, useEffect, useCallback } from '@wordpress/element';
import { rawShortcut } from '@wordpress/keycodes';
import clsx from 'clsx';
import { safeParse } from '../utils';
import { editorSettings } from './editor-settings';
import { EditorProps, StateWithUndoManager } from './editor-types';
import type { MouseEvent, KeyboardEvent, FC } from 'react';
import css from '!!css-loader!sass-loader!./inline-iframe-style.scss';
import './editor-style.scss';

const iframedCSS = css.reduce( ( css: string, [ , item ]: [ string, string ] ) => {
	return css + '\n' + item;
}, '' );

/**
 * Editor component
 */
export const Editor: FC< EditorProps > = ( { initialContent = '', onChange, isRTL } ) => {
	// We keep the content in state so we can access the blocks in the editor.
	const {
		value: editorContent,
		setValue,
		undo,
		redo,
	} = useStateWithHistory(
		initialContent !== '' ? safeParse( initialContent ) : [ createBlock( 'core/paragraph' ) ]
	) as unknown as StateWithUndoManager;
	const [ isEditing, setIsEditing ] = useState( false );

	/**
	 * This prevents the editor from copying the theme styles inside the iframe. We don't want to copy the styles inside.
	 * See: https://github.com/WordPress/gutenberg/blob/4c319590947b5f7853411e3c076861193942c6d2/packages/block-editor/src/components/iframe/index.js#L160
	 */
	const compatStylesIds = getCompatibilityStyles().map(
		( el ) => el.getAttribute( 'id' ) as string
	);

	const handleContentUpdate = useCallback(
		( content: BlockInstance[] ) => {
			setValue( content );
			onChange( serialize( content ) );
		},
		[ setValue, onChange ]
	);

	// Listen for the content height changing and update the iframe height.
	const [ contentResizeListener, { height: contentHeight } ] = useResizeObserver();

	const { selectBlock } = useDispatch( blockEditorStore );

	const selectLastBlock = ( event?: MouseEvent | KeyboardEvent ) => {
		const lastBlock = editorContent[ editorContent.length - 1 ];
		if ( lastBlock ) {
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
		}
	};

	useEffect( () => {
		// Select the first item in the editor when it loads.
		selectLastBlock();
		setIsEditing( true );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- we want to run this once
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
					settings={ editorSettings( isRTL ) }
					value={ editorContent }
					// This allows multiple editors to be used on the same page (namely inside QueryLoop).
					useSubRegistry
					onInput={ handleContentUpdate }
					onChange={ handleContentUpdate }
				>
					<div className={ clsx( 'editor__header', { 'is-editing': isEditing } ) }>
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
							<BlockCanvas styles={ [ { css: iframedCSS } ] } height={ contentHeight }>
								{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */ }
								<div
									className="editor__block-canvas-container wp-embed-responsive"
									onClick={ selectLastBlock }
								>
									{ contentResizeListener }
									<BlockList renderAppender={ false } />
								</div>
								{ compatStylesIds.map( ( id: string ) => (
									<div hidden key={ id } id={ id }></div>
								) ) }
							</BlockCanvas>
						</BlockTools>
					</div>
				</BlockEditorProvider>
			</KeyboardShortcuts>
		</SlotFillProvider>
	);
};
