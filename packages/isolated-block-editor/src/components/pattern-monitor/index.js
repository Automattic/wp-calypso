/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { parse } from '@wordpress/blocks';

/** @typedef {import('../../index').BlockEditorSettings} BlockEditorSettings */
/** @typedef {import('../../store/editor/reducer').Pattern} Pattern */

/**
 * Update callback
 *
 * @callback OnUpdate
 * @param {object[]} blocks - Editor content to save
 */

/**
 * Sets up Gutenberg and the Isolated Block Editor
 *
 * An initial setup is performed, and is then reset each time the editor is focussed. This ensures we are applying the right
 * settings for this particular editor.
 *
 * @param {object} props - Component props
 * @param {BlockEditorSettings} props.settings - Settings
 * @param {Pattern} props.currentPattern - Currently selected pattern
 * @param {OnUpdate} props.updateBlocksWithoutUndo - Callback to update blocks
 */
function PatternMonitor( props ) {
	const { currentPattern, updateBlocksWithoutUndo } = props;

	// Monitor the current pattern and update the editor content if it changes
	useEffect( () => {
		if ( currentPattern === null ) {
			return;
		}

		updateBlocksWithoutUndo( parse( currentPattern.content ) );
	}, [ currentPattern ] );

	return null;
}

export default compose( [
	withSelect( ( select ) => {
		const { getCurrentPattern } = select( 'isolated/editor' );

		return {
			currentPattern: getCurrentPattern(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { updateBlocksWithoutUndo } = dispatch( 'isolated/editor' );

		return {
			updateBlocksWithoutUndo,
		};
	} ),
] )( PatternMonitor );
