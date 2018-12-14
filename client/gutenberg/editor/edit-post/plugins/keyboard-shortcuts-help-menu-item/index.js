/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress Dependencies
 */
import { MenuItem } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { displayShortcut } from '@wordpress/keycodes';

export function KeyboardShortcutsHelpMenuItem( { openModal, onSelect } ) {
	return (
		<MenuItem
			onClick={ () => {
				onSelect();
				openModal( 'edit-post/keyboard-shortcut-help' );
			} }
			shortcut={ displayShortcut.access( 'h' ) }
		>
			{ __( 'Keyboard Shortcuts' ) }
		</MenuItem>
	);
}

export default withDispatch( dispatch => {
	const { openModal } = dispatch( 'core/edit-post' );

	return {
		openModal,
	};
} )( KeyboardShortcutsHelpMenuItem );
