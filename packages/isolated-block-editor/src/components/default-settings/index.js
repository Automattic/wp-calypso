/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

/** @typedef {import('../../index').BlockEditorSettings} BlockEditorSettings */

function getMenu( current, defaultMenu ) {
	if ( current === false ) {
		return false;
	}

	return defaultMenu;
}

/**
 * Apply default settings to the user supplied settings, ensuring we have a full and valid set of settings
 *
 * @param {BlockEditorSettings} settings - Settings
 * @returns {BlockEditorSettings} Settings
 **/
export default function applyDefaultSettings( settings ) {
	const { iso, editor } = settings;

	return {
		iso: {
			// No preferences or persistence
			preferencesKey: iso?.preferencesKey ?? null,
			persistenceKey: iso?.persistenceKey ?? null,

			// No disallowed embeds
			disallowEmbed: iso?.disallowEmbed ?? [],

			// Default to all blocks
			blocks: {
				allowBlocks: iso?.blocks?.allowBlocks ?? [],
				disallowBlocks: iso?.blocks?.disallowBlocks ?? [],
			},

			// Inserter, undo, and inspector is on, everything else is off
			toolbar: {
				inserter: true,
				inspector: false,
				navigation: false,
				toc: false,
				undo: true,

				...( iso?.toolbar ?? {} ),
			},

			// Nothing appears in the 'more menu'
			moreMenu: getMenu( iso?.moreMenu, {
				editor: false,
				fullscreen: false,
				preview: false,
				topToolbar: false,

				...( iso?.moreMenu ?? {} ),
			} ),

			// No link menu
			linkMenu: iso?.linkMenu ?? [],

			// Default to top toolbar
			defaultPreferences: {
				fixedToolbar: true,
				...( iso?.defaultPreferences ?? {} ),
			},

			allowApi: iso?.allowApi ?? false,

			// No default pattern
			currentPattern: iso?.currentPattern ?? null,

			// No patterns
			patterns: iso?.patterns ?? [],
		},
		editor: {
			alignWide: true,
			disableCustomColors: false,
			disableCustomFontSizes: false,
			disablePostFormats: true,
			titlePlaceholder: __( 'Add title' ),
			bodyPlaceholder: __( 'Start writing or type / to choose a block' ),
			isRTL: false,
			autosaveInterval: 60,
			maxUploadFileSize: 0,
			allowedMimeTypes: [],
			styles: {
				css: "body { font-family: 'Noto Serif' }",
			},
			imageSizes: [],
			richEditingEnabled: true,
			codeEditingEnabled: false,
			allowedBlockTypes: true,
			__experimentalCanUserUseUnfilteredHTML: false,

			// Default to no patterns, reusable blocks
			__experimentalBlockPatterns: false,
			resuableBlocks: false,

			// Default to fixed top toolbar
			fixedToolbar: true,

			...editor,

			availableLegacyWidgets: {},
			hasPermissionsToManageWidgets: false,

			// Default to no link suggestions
			__experimentalFetchLinkSuggestions: editor?.__experimentalFetchLinkSuggestions
				? editor?.__experimentalFetchLinkSuggestions
				: () => [],
		},
	};
}
