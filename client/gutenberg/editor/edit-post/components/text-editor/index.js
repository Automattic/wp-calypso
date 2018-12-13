/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PostTextEditor, PostTitle } from '@wordpress/editor';
import { IconButton } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { displayShortcut } from '@wordpress/keycodes';
import { compose } from '@wordpress/compose';

function TextEditor( { onExit, isRichEditingEnabled } ) {
	return (
		<div className="edit-post-text-editor">
			{ isRichEditingEnabled && (
				<div className="edit-post-text-editor__toolbar">
					<h2>{ __( 'Editing Code' ) }</h2>
					<IconButton
						onClick={ onExit }
						icon="no-alt"
						shortcut={ displayShortcut.secondary( 'm' ) }
					>
						{ __( 'Exit Code Editor' ) }
					</IconButton>
				</div>
			) }
			<div className="edit-post-text-editor__body">
				<PostTitle />
				<PostTextEditor />
			</div>
		</div>
	);
}

export default compose(
	withSelect( select => ( {
		isRichEditingEnabled: select( 'core/editor' ).getEditorSettings().richEditingEnabled,
	} ) ),
	withDispatch( dispatch => {
		return {
			onExit() {
				dispatch( 'core/edit-post' ).switchEditorMode( 'visual' );
			},
		};
	} )
)( TextEditor );
