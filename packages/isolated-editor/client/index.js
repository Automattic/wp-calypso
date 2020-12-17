import React from 'react';

window.React = React;

/**
 * WordPress dependencies
 */

import '@wordpress/editor';
import { StrictMode } from '@wordpress/element';
import { SlotFillProvider, DropZoneProvider } from '@wordpress/components';
import { MediaUpload } from '@wordpress/media-utils';
import { registerCoreBlocks } from '@wordpress/block-library';
import { addFilter } from '@wordpress/hooks';
import { use } from '@wordpress/data';
import '@wordpress/format-library';

/**
 * Internal dependencies
 */

import BlockEditorContainer from './components/block-editor-container';
import withRegistryProvider from './components/with-registry-provider';
import EditorSetup from './components/editor-setup';
import PatternMonitor from './components/pattern-monitor';
import ContentSaver from './components/content-saver';
import registerApiHandlers from './components/api-fetch';
import storeHotSwapPlugin from './store/plugins/store-hot-swap';
import storeDecoratorPlugin from './store/plugins/store-decorator';
import decoratedEditorStore from './store/core-editor';

// Export library components
import EditorLoaded from './components/editor-loaded';

// A fake edit-post store is needed
import './store/edit-post';
import './style.scss';

/** @typedef {import('./components/block-editor-toolbar/more-menu').OnMore} OnMore */
/** @typedef {import('./store/editor/reducer').Pattern} Pattern */

/**
 * Toolbar settings
 *
 * @typedef ToolbarSettings
 * @property {boolean} inserter - Enable or disable the toolbar block inserter
 * @property {boolean} inspector - Enable or disable the toolbar block inspector
 * @property {boolean} navigation - Enable or disable the toolbar navigation button
 * @property {boolean} toc - Enable or disable the toolbar table of contents button
 * @property {boolean} undo - Enable or disable the toolbar undo/redo buttons
 */

/**
 * More menu settings
 *
 * @typedef MoreMenuSettings
 * @property {boolean} editor - Enable or disable the editor sub menu (visual/code editing)
 * @property {boolean} fullscreen - Enable or disable the fullscreen option
 * @property {boolean} preview - Enable or disable the preview option
 * @property {boolean} topToolbar - Enable or disable the 'top toolbar' option
 */

/**
 * Isolated Editor Settings
 *
 * @typedef IsoSettings
 * @property {string|null} preferencesKey - Preferences key. Set to null to disable
 * @property {string|null} persistenceKey - Persistence key. Set to null to disable
 * @property {{allowBlocks: string[], disallowBlocks: string[]}} blocks - Block restrictions
 * @property {string[]} disallowEmbed - List of embed names to remove
 * @property {ToolbarSettings} toolbar - Toolbar settings
 * @property {MoreMenuSettings|false} moreMenu - More menu settings, or false to disable
 * @property {{title: string, url: string}[]} linkMenu - Link menu settings
 * @property {string} currentPattern - The pattern to start with
 * @property {Pattern[]} patterns - List of patterns
 * @property {object} defaultPreferences - Default preferences if nothing in localStorage
 * @property {boolean} allowApi - Allow API requests
 */

/**
 * Block Editor Settings
 *
 * @typedef BlockEditorSettings
 * @property {IsoSettings} iso - Isolated editor settings
 * @property {EditorSettings} editor - Gutenberg editor settings
 */

/**
 * Gutenberg Editor Settings - this isn't the complete object, but just enough for linting here
 *
 * @typedef EditorSettings
 * @property {boolean} hasUploadPermissions
 * @property {object} allowedMimeTypes
 * @property {string[]} allowedBlockTypes
 * @property {boolean} hasFixedToolbar
 * @property {null|object} mediaUpload
 * @property {object[]|null} template
 * @property {null} templateLock
 * @property {object[]} resuableBlocks
 */

/**
 * Initialize Gutenberg
 *
 * @param {boolean} [allowApi] Allow API requests
 */
export function initializeEditor( allowApi = false ) {
	if ( window.isoInitialised ) {
		return;
	}

	// This allows the editor to swap stores dynamically
	use( storeHotSwapPlugin, {} );

	// This decorate core/editor with some custom selectors
	use( storeDecoratorPlugin, decoratedEditorStore );

	// This is needed for the media uploader
	addFilter( 'editor.MediaUpload', 'p2editor/media-upload', () => MediaUpload );

	// Register all core blocks
	registerCoreBlocks();

	// Inject our API fetch handlers
	if ( ! allowApi ) {
		registerApiHandlers();
	}

	// Don't run this again
	window.isoInitialised = true;
}

/**
 * Save blocks callback
 *
 * @callback OnSaveBlocks
 * @param {object[]} blocks - Editor content to save
 * @param {string[]} ignoredContent - Possible content to ignore
 */

/**
 * Save blocks callback
 *
 * @callback OnSaveContent
 * @param {string} content - Serialized content
 */

/**
 * Parser callback
 *
 * @callback OnParse
 * @param {string} content - HTML content
 * @returns {object[]}
 */

/**
 * Initial load blocks callback
 *
 * @callback OnLoad
 * @param {OnParse} parse - Current block parser
 * @param {OnParse} rawHandler - Current raw handler
 * @returns {object[]}
 */

/**
 * Error callback
 *
 * @callback OnError
 */

/**
 * Isolated block editor component.
 *
 * This wraps up the Gutenberg editor along with a customised store. The contents of the editor are unique, and multiple instances
 * can be created.
 *
 * @param {object} props - Component props
 * @param {OnSaveBlocks} [props.onSaveBlocks] - Save callback
 * @param {OnSaveContent} [props.onSaveContent] - Save callback
 * @param {OnError} props.onError - Error callback
 * @param {OnLoad} [props.onLoad] - Initial blocks
 * @param {BlockEditorSettings} props.settings - Settings
 * @param {object} props.children - Child content
 * @param {string} [props.className] - Additional class name
 * @param {OnMore} [props.renderMoreMenu] - Callback to render additional items in the more menu
 */
function IsolatedBlockEditor( props ) {
	const { children, onSaveContent, onSaveBlocks, settings, ...params } = props;

	initializeEditor( settings?.iso?.allowApi );

	return (
		<StrictMode>
			<div className="interface-interface-skeleton__content" />

			<ContentSaver onSaveBlocks={ onSaveBlocks } onSaveContent={ onSaveContent } />
			<EditorSetup settings={ settings } />
			<PatternMonitor />

			<SlotFillProvider>
				<DropZoneProvider>
					<BlockEditorContainer { ...params } settings={ settings }>
						{ children }
					</BlockEditorContainer>
				</DropZoneProvider>
			</SlotFillProvider>
		</StrictMode>
	);
}

export default withRegistryProvider( IsolatedBlockEditor );

export { EditorLoaded };
