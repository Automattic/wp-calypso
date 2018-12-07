/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { KeyboardShortcuts } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import shortcuts from '../../keyboard-shortcuts';

class EditorModeKeyboardShortcuts extends Component {
	constructor() {
		super( ...arguments );

		this.toggleMode = this.toggleMode.bind( this );
		this.toggleSidebar = this.toggleSidebar.bind( this );
	}

	toggleMode() {
		const { mode, switchMode, isRichEditingEnabled } = this.props;
		if ( ! isRichEditingEnabled ) {
			return;
		}
		switchMode( mode === 'visual' ? 'text' : 'visual' );
	}

	toggleSidebar( event ) {
		// This shortcut has no known clashes, but use preventDefault to prevent any
		// obscure shortcuts from triggering.
		event.preventDefault();
		const { isEditorSidebarOpen, closeSidebar, openSidebar } = this.props;

		if ( isEditorSidebarOpen ) {
			closeSidebar();
		} else {
			openSidebar();
		}
	}

	render() {
		return (
			<KeyboardShortcuts
				bindGlobal
				shortcuts={ {
					[ shortcuts.toggleEditorMode.raw ]: this.toggleMode,
					[ shortcuts.toggleSidebar.raw ]: this.toggleSidebar,
				} }
			/>
		);
	}
}

export default compose( [
	withSelect( select => ( {
		isRichEditingEnabled: select( 'core/editor' ).getEditorSettings().richEditingEnabled,
		mode: select( 'core/edit-post' ).getEditorMode(),
		isEditorSidebarOpen: select( 'core/edit-post' ).isEditorSidebarOpened(),
		hasBlockSelection: !! select( 'core/editor' ).getBlockSelectionStart(),
	} ) ),
	withDispatch( ( dispatch, { hasBlockSelection } ) => ( {
		switchMode( mode ) {
			dispatch( 'core/edit-post' ).switchEditorMode( mode );
		},
		openSidebar() {
			const sidebarToOpen = hasBlockSelection ? 'edit-post/block' : 'edit-post/document';
			dispatch( 'core/edit-post' ).openGeneralSidebar( sidebarToOpen );
		},
		closeSidebar: dispatch( 'core/edit-post' ).closeGeneralSidebar,
	} ) ),
] )( EditorModeKeyboardShortcuts );
