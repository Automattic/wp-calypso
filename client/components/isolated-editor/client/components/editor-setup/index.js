/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */

import getEditorSettings from './editor-settings';

/** @typedef {import('../../index').BlockEditorSettings} BlockEditorSettings */

/**
 * Settings callback
 * @callback OnSettings
 * @param {BlockEditorSettings} settings
 */

/**
 * Sets up Gutenberg and the Isolated Block Editor
 *
 * An initial setup is performed, and is then reset each time the editor is focussed. This ensures we are applying the right
 * settings for this particular editor.
 *
 * @param {object} props - Component props
 * @param {BlockEditorSettings} props.currentSettings - Modified settings
 * @param {OnSettings} props.updateSettings - Update settings
 * @param {OnSettings} props.setupEditor - Set up the Gutenberg editor
 * @param {boolean} props.isEditing - Are we editing in this editor?
 * @param {boolean} props.topToolbar - Is the top toolbar enabled?
 */
function EditorSetup( props ) {
	const { currentSettings, updateSettings, setupEditor, isEditing, topToolbar } = props;

	// This is the initial setup
	useEffect( () => {
		// Setup the Isolated Editor & Gutenberg
		setupEditor( currentSettings );
		updateSettings( currentSettings );
	}, [] );

	// Run whenever the editor is focussed, or the topToolbar setting or reusable blocks change
	useEffect( () => {
		if ( ! isEditing ) {
			return;
		}

		// Setup Gutenberg for this editor, but only when focussed. This swaps allowed blocks and other capabilities
		updateSettings( currentSettings );
	}, [ isEditing, topToolbar, currentSettings.editor.reusableBlocks ] );

	return null;
}

export default compose( [
	withSelect( ( select, { settings }, registry ) => {
		const { isEditing, isFeatureActive } = select( 'isolated/editor' );
		const { getBlockTypes } = select( 'core/blocks' );
		const blockTypes = getBlockTypes();
		const hasFixedToolbar = isFeatureActive( 'fixedToolbar' );
		const reusableBlocks = select( 'core' ).getEntityRecords( 'postType', 'wp_block' );

		return {
			isEditing: isEditing(),
			topToolbar: hasFixedToolbar,
			currentSettings: useMemo(
				() => ( {
					...settings,

					editor: {
						...getEditorSettings(
							settings.editor,
							settings.iso,
							blockTypes,
							hasFixedToolbar || settings.editor?.hasFixedToolbar || false
						),

						// Reusable blocks
						...( settings.editor?.__experimentalReusableBlocks === false
							? {
									__experimentalReusableBlocks: reusableBlocks,
									__experimentalFetchReusableBlocks: false,
							  }
							: {
									__experimentalReusableBlocks: reusableBlocks,
									__experimentalFetchReusableBlocks: registry.dispatch( 'core/editor' )
										.__experimentalFetchReusableBlocks,
							  } ),
					},
				} ),
				[ settings, blockTypes, hasFixedToolbar, reusableBlocks ]
			),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { updateEditorSettings } = dispatch( 'core/editor' );
		const { updateSettings } = dispatch( 'core/block-editor' );
		const { setupEditor } = dispatch( 'isolated/editor' );

		return {
			setupEditor,
			updateSettings: ( { editor } ) => {
				updateSettings( editor );
				updateEditorSettings( editor );
			},
		};
	} ),
] )( EditorSetup );
