import React, { Component, PropTypes } from 'react';
import {
	map
} from 'lodash';
import {
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
} from 'draft-js';

import Token from './token';
import { fromEditor, toEditor } from './parser';

const buttonStyle = {
	padding: '3px',
	margin: '3px',
	marginRight: '5px',
	backgroundColor: '#ebebeb',
	borderRadius: '3px',
	fontWeight: 'bold'
};

const editorStyle = {
	margin: '12px',
	padding: '8px',
	border: '1px solid black',
	borderRadius: '3px'
};

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createWithContent(
				toEditor( props.titleFormats, props.tokens ),
				new CompositeDecorator( [ {
					strategy: this.renderTokens,
					component: Token
				} ] )
			)
		};

		this.storeEditorReference = r => ( this.editor = r );
		this.focusEditor = () => this.editor.focus();

		this.updateEditor = this.updateEditor.bind( this );
		this.addToken = this.addToken.bind( this );
		this.renderTokens = this.renderTokens.bind( this );
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
			<div style={ editorStyle }>
				<div style={ { marginBottom: '10px' } }>
					{ type.label }
					{ map( tokens, ( title, name ) => (
						<span
							key={ name }
							style={ buttonStyle }
							onClick={ this.addToken( title, name ) }
						>
							{ title }
						</span>
					) ) }
				</div>
				<Editor
					editorState={ editorState }
					onChange={ this.updateEditor }
					ref={ this.storeEditorReference }
				/>
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
