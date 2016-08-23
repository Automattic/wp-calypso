import React, { Component, PropTypes } from 'react';
import {
	map,
	max,
	min,
} from 'lodash';
import {
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
	SelectionState,
} from 'draft-js';

import Token from './token';
import { fromEditor, toEditor } from './parser';

const Chip = onClick => props => <Token { ...props } onClick={ onClick } />;

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.storeEditorReference = r => ( this.editor = r );
		this.focusEditor = () => this.editor.focus();

		this.updateEditor = this.updateEditor.bind( this );
		this.addToken = this.addToken.bind( this );
		this.removeToken = this.removeToken.bind( this );
		this.renderTokens = this.renderTokens.bind( this );

		this.state = {
			editorState: EditorState.createWithContent(
				toEditor( props.titleFormats, props.tokens ),
				new CompositeDecorator( [ {
					strategy: this.renderTokens,
					component: Chip( this.removeToken )
				} ] )
			)
		};
	}

	updateEditor( editorState ) {
		const { onChange, type } = this.props;
		const currentContent = editorState.getCurrentContent();

		// limit to one line
		if ( currentContent.getBlockMap().size > 1 ) {
			return;
		}

		this.setState(
			{ editorState },
			() => {
				editorState.lastChangeType === 'add-token' && this.focusEditor();
				onChange( type.value, fromEditor( currentContent ) );
			}
		);
	}

	addToken( title, name ) {
		return () => {
			const { editorState } = this.state;
			const currentSelection = editorState.getSelection();

			const tokenEntity = Entity.create( 'TOKEN', 'IMMUTABLE', { name } );

			const contentState = Modifier.replaceText(
				editorState.getCurrentContent(),
				currentSelection,
				title,
				null,
				tokenEntity
			);

			this.updateEditor( EditorState.push(
				editorState,
				contentState,
				'add-token'
			) );
		};
	}

	removeToken( entityKey ) {
		return () => {
			const { editorState } = this.state;
			const currentContent = editorState.getCurrentContent();
			const currentSelection = editorState.getSelection();

			const block = currentContent.getBlockForKey( currentSelection.focusKey );

			// get characters in entity
			const indices = block
				.getCharacterList()
				.reduce( ( ids, value, key ) => {
					return entityKey === value.entity
						? [ ...ids, key ]
						: ids;
				}, [] );

			const range = SelectionState
				.createEmpty( block.key )
				.set( 'anchorOffset', min( indices ) )
				.set( 'focusOffset', max( indices ) );

			this.updateEditor(
				EditorState.push(
					editorState,
					Modifier.removeRange(
						currentContent,
						range,
						'forward'
					),
					'remove-range'
				)
			);
		};
	}

	renderTokens( contentBlock, callback ) {
		contentBlock.findEntityRanges(
			character => {
				const entity = character.getEntity();

				if ( null === entity ) {
					return false;
				}

				return 'TOKEN' === Entity.get( entity ).getType();
			},
			callback
		);
	}

	render() {
		const { editorState } = this.state;
		const { tokens, type } = this.props;

		return (
			<div className="title-format-editor">
				<div className="title-format-editor__header">
					<span className="title-format-editor__title">{ type.label }</span>
					{ map( tokens, ( title, name ) => (
						<span
							key={ name }
							className="title-format-editor__button"
							onClick={ this.addToken( title, name ) }
						>
							{ title }
						</span>
					) ) }
				</div>
				<div className="title-format-editor__editor-wrapper">
					<Editor
						editorState={ editorState }
						onChange={ this.updateEditor }
						ref={ this.storeEditorReference }
					/>
				</div>
				<div className="title-format-editor__preview">Preview: What's up with that?</div>
			</div>
		);
	}
}

TitleFormatEditor.displayName = 'TitleFormatEditor';

TitleFormatEditor.propTypes = {
	type: PropTypes.object.isRequired,
	tokens: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired
};

export default TitleFormatEditor;
