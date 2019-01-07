/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { Component } from '@wordpress/element';
import { debounce, noop, flowRight } from 'lodash';
import TinyMCE from 'components/tinymce';

/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';

export class ClassicEdit extends Component {
	componentDidMount() {
		const { attributes } = this.props;
		const { content } = attributes;

		if ( this.editor && content ) {
			this.editor.setEditorContent( content );
		}
		this.lastContentUpdate = Date.now();
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

		//A fresh classic block does not fire the blur handler on the first blur event
		//So make sure we blur when the block is unselected, for example, when we click on save.
		if ( blockBlur ) {
			this.updateBlockContentAndBookmark();
		}

		const shouldSetEditorContent =
			this.editor &&
			this.editor._editor &&
			prevProps.attributes.content !== content &&
			this.editor._editor.getContent() !== content &&
			this.props.mode !== 'html';

		if ( shouldSetEditorContent ) {
			this.editor.setEditorContent( content || '' );
		}
	}

	updateBlockContentAndBookmark = debounce( () => {
		if ( ! this.editor || this.props.mode === 'html' ) {
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
	}, 300 );

	updateBlockContent = debounce( () => {
		if ( ! this.editor || this.props.mode === 'html' ) {
			return;
		}
		const editor = this.editor._editor;
		const content = editor.getContent();

		this.props.setAttributes( { content } );
	}, 300 );

	render() {
		const { isSelected, setSelected } = this.props;
		// The block in wordpress/editor, block-list/block-html.js takes over the html editing (Edit as HTML),
		// while this component handles the visual mode (Edit Visually). When in html mode, don't bother setting
		// editor content, or try to update block attributes, as the other component is already handling that.
		return (
			<TinyMCE
				isGutenbergClassicBlock
				mode="tinymce"
				onBlur={ this.updateBlockContentAndBookmark }
				onChange={ this.updateBlockContent }
				onClick={ isSelected ? noop : setSelected }
				onKeyUp={ this.updateBlockContent }
				onSetContent={ this.updateBlockContent }
				onTextEditorChange={ this.updateBlockContent }
				ref={ this.storeEditor }
			/>
		);
	}
}

export default flowRight( [
	withSelect( ( select, { clientId } ) => {
		const { getBlockMode } = select( 'core/editor' );
		return {
			mode: getBlockMode( clientId ),
		};
	} ),
	withDispatch( ( dispatch, { clientId } ) => ( {
		setSelected: () => dispatch( 'core/editor' ).selectBlock( clientId ),
	} ) ),
] )( ClassicEdit );
