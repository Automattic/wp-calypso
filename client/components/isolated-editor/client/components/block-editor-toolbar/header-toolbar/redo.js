/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { displayShortcut } from '@wordpress/keycodes';
import { redo as redoIcon } from '@wordpress/icons';
import { forwardRef } from '@wordpress/element';

function EditorHistoryRedo( props, ref ) {
	const hasRedo = useSelect( ( select ) => select( 'core/editor' ).hasEditorRedo(), [] );
	const { redo } = useDispatch( 'core/editor' );
	return (
		<Button
			{ ...props }
			ref={ ref }
			icon={ redoIcon }
			label={ __( 'Redo' ) }
			shortcut={ displayShortcut.primaryShift( 'z' ) }
			// If there are no redo levels we don't want to actually disable this
			// button, because it will remove focus for keyboard users.
			// See: https://github.com/WordPress/gutenberg/issues/3486
			aria-disabled={ ! hasRedo }
			onClick={ hasRedo ? redo : undefined }
			className="editor-history__redo"
		/>
	);
}

export default forwardRef( EditorHistoryRedo );
