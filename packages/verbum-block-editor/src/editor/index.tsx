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
import { useDispatch, useSelect } from '@wordpress/data';
import { rawShortcut } from '@wordpress/keycodes';
import clsx from 'clsx';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { safeParse } from '../utils';
import { editorSettings } from './editor-settings';
import { EditorProps, StateWithUndoManager } from './editor-types';
import type { FC, MouseEvent } from 'react';
import darkModeCss from '!!css-loader!sass-loader!./inline-iframe-style-dark-mode.scss';
import css from '!!css-loader!sass-loader!./inline-iframe-style.scss';
import './editor-style.scss';

const EDITOR_MAIN_CLASS: string = 'editor__main';
const iframedCSS = css.reduce( ( css: string, [ , item ]: [ string, string ] ) => {
	return css + '\n' + item;
}, '' );

/**
 * Editor component
 */
export const Editor: FC< EditorProps > = ( {
	initialContent = '',
	focusOnMount = true,
	onChange,
	isRTL,
	isDarkMode,
	customStyles = '',
} ) => {
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

	const handleNewParagraphAfterNonTextBlock = ( event?: MouseEvent< HTMLDivElement > ): void => {
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
					}
				}
			}
		}
	};

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
					styles={ [
						{
							css: isDarkMode ? iframedCSS + darkModeCss + customStyles : iframedCSS + customStyles,
						},
					] }
				>
					<InitialBlockSelector
						focusOnMount={ focusOnMount }
						onBlockSelect={ () => setIsEditing( true ) }
					/>
					<div className={ clsx( 'editor__header', { 'is-editing': isEditing } ) }>
						<div className="editor__header-wrapper">
							<div className="editor__header-toolbar">
								<BlockToolbar hideDragHandle />
							</div>
							<Popover.Slot />
						</div>
					</div>
					<div className={ EDITOR_MAIN_CLASS }>
						<Popover.Slot />
						<BlockTools>
							<BlockCanvas
								styles={ [
									{
										css: isDarkMode
											? iframedCSS + darkModeCss + customStyles
											: iframedCSS + customStyles,
									},
								] }
								height={ contentHeight }
							>
								{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */ }
								<div
									className="editor__block-canvas-container wp-embed-responsive"
									onClick={ handleNewParagraphAfterNonTextBlock }
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

/**
 * Component to select the last block on initial load.
 *
 * NOTE: Must be rendered inside BlockEditorProvider to access the correct store context.
 */
function InitialBlockSelector( {
	focusOnMount,
	onBlockSelect,
}: {
	focusOnMount: boolean;
	onBlockSelect: () => void;
} ): null {
	const { selectBlock } = useDispatch( blockEditorStore );
	const storeBlocks = useSelect( ( select ) => select( blockEditorStore ).getBlocks(), [] );
	const hasInitialized = useRef( false );

	/**
	 * Waits for the selected block to be available in the DOM and then overrides the "scrollIntoView" function to prevent scrolling on initial load.
	 *
	 * As of v15.12 Gutenberg is using "useScrollIntoView" hook to scroll the selected block into view even when `initialPosition` of the block is set to "null" (no focus).
	 * This is bringing the block into the view when the user doesn't want it.
	 */
	const waitForSelectedElementAndOverrideScroll = useCallback( () => {
		// If we are focusing on mount then keep the default behavior of scrolling.
		if ( focusOnMount ) {
			return;
		}

		const blockSelector = '.wp-block.is-selected';
		const editorIframe = document.querySelector(
			`.${ EDITOR_MAIN_CLASS } iframe`
		) as HTMLIFrameElement | null;

		if ( ! editorIframe?.contentDocument ) {
			return;
		}

		let selectedElement: HTMLElement | null | undefined;
		let originalScrollIntoView: ( arg?: boolean | ScrollIntoViewOptions ) => void;

		const interval = setInterval( () => {
			selectedElement = editorIframe?.contentDocument?.querySelector( blockSelector );

			if ( ! selectedElement ) {
				return;
			}

			// Store original and replace with empty function.
			originalScrollIntoView = selectedElement.scrollIntoView;
			selectedElement.scrollIntoView = () => {};
			clearInterval( interval );
		}, 50 );

		// Clear interval and restore the original scrollIntoView to prevent breaking any future calls.
		setTimeout( () => {
			clearInterval( interval );

			// Restore original scrollIntoView if it was replaced
			if ( selectedElement && originalScrollIntoView ) {
				selectedElement.scrollIntoView = originalScrollIntoView;
			}
		}, 5000 );
	}, [ focusOnMount ] );

	useEffect( () => {
		// To ensure we only run this useEffect once.
		if ( hasInitialized.current ) {
			return;
		}

		const lastBlock = storeBlocks[ storeBlocks.length - 1 ];
		if ( ! lastBlock ) {
			return;
		}

		hasInitialized.current = true;

		selectBlock( lastBlock.clientId, focusOnMount ? 0 : null ).then( () => {
			waitForSelectedElementAndOverrideScroll();
			onBlockSelect();
		} );
	}, [
		selectBlock,
		storeBlocks,
		onBlockSelect,
		focusOnMount,
		waitForSelectedElementAndOverrideScroll,
	] );

	return null;
}
