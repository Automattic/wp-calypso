import {
	BlockEditorProvider,
	BlockToolbar,
	BlockList,
	Inserter,
	BlockCanvas,
} from '@wordpress/block-editor';
import { createBlock, type BlockInstance } from '@wordpress/blocks';
import { Popover, SlotFillProvider } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useState, useEffect } from '@wordpress/element';
import classNames from 'classnames';
import css from '!!css-loader!sass-loader!./inline-iframe-style.scss';

/**
 * Gutenberg Editor Settings
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/store/defaults.js
 */
const settings = {
	disableCustomColors: false,
	disableCustomFontSizes: false,
	disablePostFormats: true,
	isDistractionFree: true,
	isRTL: false,
	autosaveInterval: 60,
	codeEditingEnabled: false,
	bodyPlaceholder: 'Leave a comment',
	supportsLayout: false,
	colors: [],
	fontSizes: [],
	imageDefaultSize: 'medium',
	imageSizes: [],
	imageEditing: false,
	maxWidth: 580,
	allowedBlockTypes: true,
	maxUploadFileSize: 0,
	allowedMimeTypes: null,
	canLockBlocks: false,
	enableOpenverseMediaCategory: false,
	clearBlockSelection: true,
	__experimentalCanUserUseUnfilteredHTML: false,
	__experimentalBlockDirector: false,
	__mobileEnablePageTemplates: false,
	__experimentalBlockPatterns: [],
	__experimentalBlockPatternCategories: [],
	__unstableGalleryWithImageBlocks: false,
	__unstableIsPreviewMode: false,
	blockInspectorAnimation: {},
	generateAnchors: false,
	gradients: [],
	__unstableResolvedAssets: {
		styles: [],
		scripts: [],
	},
};

interface EditorProps {
	initialContent?: BlockInstance[];
	saveContent: ( content: BlockInstance[] ) => void;
}

/**
 * Editor component
 * @param initialContent  Initial content to load into the editor.
 * @param saveContent     Callback that runs when the editor content changes.
 * @returns                Instance of the Gutenberg editor with the canvas in an iframe.
 */
export const Editor: React.FC< EditorProps > = ( { initialContent, saveContent } ) => {
	// We keep the content in state so we can access the blocks in the editor.
	const [ editorContent, setEditorContent ] = useState(
		initialContent || [ createBlock( 'core/paragraph' ) ]
	);

	debugger;

	const [ isEditing, setIsEditing ] = useState( false );

	const handleContentUpdate = ( content: BlockInstance[] ) => {
		setEditorContent( content );
		saveContent( content );
	};

	// Listen for the content height changing and update the iframe height.
	const [ contentResizeListener, { height: contentHeight } ] = useResizeObserver();

	useEffect( () => {
		setIsEditing( true );
	}, [] );

	const iframedCSS = css.reduce( ( css, [ _, item ] ) => {
		return css + '\n' + item;
	}, '' );

	return (
		<SlotFillProvider>
			<BlockEditorProvider
				settings={ settings }
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
						<Inserter __experimentalIsQuick />
						{ /* @ts-expect-error - type definition missing */ }
						<Popover.Slot />
					</div>
				</div>
				<div className="editor__main">
					<BlockCanvas styles={ [ { css: iframedCSS } ] } height={ contentHeight }>
						<div className="editor__block-canvas-container">
							{ contentResizeListener }
							<BlockList renderAppender={ false } />
						</div>
					</BlockCanvas>
				</div>
			</BlockEditorProvider>
		</SlotFillProvider>
	);
};
