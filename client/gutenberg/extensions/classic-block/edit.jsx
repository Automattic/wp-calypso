/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { Component } from '@wordpress/element';
import { noop } from 'lodash';
import TinyMCE from 'components/tinymce';

/**
 * WordPress dependencies
 */
import { withDispatch } from '@wordpress/data';

export class ClassicEdit extends Component {
	componentDidMount() {
		const { attributes } = this.props;
		const { content } = attributes;

		if ( this.editor && content ) {
			this.editor.setEditorContent( content );
		}
	}

	storeEditor = ref => {
		// By the time editor lifecycle events like PostProcess fire, this editor instance is already marked for removal
		// so any content manipulation doesn't get reflected in this block.
		//
		// For now, when we detect an unmount, get content from the editor marked to be destroyed and update block
		// attributes.
		//
		// https://github.com/Automattic/wp-calypso/issues/29643
		const isUnmounting = ! ref && this.editor;
		if ( isUnmounting ) {
			const content = this.editor._editor.getContent();
			this.props.setAttributes( { content } );
		}
		this.editor = ref;
	};

	componentDidUpdate( prevProps ) {
		const {
			attributes: { content },
			isSelected,
		} = this.props;

		const blockBlur = prevProps.isSelected === true && isSelected === false;

		if ( blockBlur ) {
			this.updateBlockContentAndBookmark();
		}

		if ( this.editor && prevProps.attributes.content !== content ) {
			this.editor.setEditorContent( content || '' );
		}
	}

	updateBlockContentAndBookmark = () => {
		if ( ! this.editor ) {
			return;
		}
		const editor = this.editor._editor;

		// Taken from the Core Classic Editor, this returns an offset bookmark, whose position is based after content
		// normalization.
		//
		// https://www.tiny.cloud/docs/api/tinymce.dom/tinymce.dom.selection/#getbookmark
		// https://github.com/tinymce/tinymce/blob/146c3c7c98206f21fbe12f61537ff42dbe5c6c3a/src/core/main/ts/bookmark/GetBookmark.ts#L154
		this.bookmark = editor.selection.getBookmark( 2, true );

		this.props.setAttributes( {
			content: editor.getContent(),
		} );

		editor.once( 'focus', () => {
			if ( this.bookmark ) {
				editor.selection.moveToBookmark( this.bookmark );
			}
		} );

		return false;
	};

	render() {
		const { isSelected, setSelected } = this.props;
		return (
			<TinyMCE
				isGutenbergClassicBlock
				mode="tinymce"
				onClick={ isSelected ? noop : setSelected }
				ref={ this.storeEditor }
			/>
		);
	}
}

export default withDispatch( ( dispatch, { clientId } ) => ( {
	setSelected: () => dispatch( 'core/editor' ).selectBlock( clientId ),
} ) )( ClassicEdit );
