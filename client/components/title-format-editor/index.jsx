import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
	get,
	map,
	max,
	min
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
import { getSeoTitle } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';

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

			const withoutToken = EditorState.push(
				editorState,
				Modifier.removeRange(
					currentContent,
					range,
					'forward'
				),
				'remove-range'
			);

			const selectionBeforeToken = EditorState.forceSelection(
				withoutToken,
				range
					.set( 'anchorOffset', min( indices ) )
					.set( 'focusOffset', min( indices ) )
			);

			this.updateEditor( selectionBeforeToken );
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
		const { translate, tokens, type, previewText } = this.props;

		const formattedPreview = previewText
			? `${ translate( 'Preview' ) }: ${ previewText }`
			: '';

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
				<div className="title-format-editor__preview">{ formattedPreview }</div>
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

const mapStateToProps = ( state, ownProps ) => {
	const site = getSelectedSite( state );
	const type = get( ownProps, 'type.value', '' );

	// Add example content for post/page title, tag name and archive dates
	// TODO: translate() not working here?
	const content = {
		site,
		post: { title: 'Example Title' },
		tag: 'Example Tag',
		date: 'August 2013'
	};

	return ( {
		previewText: getSeoTitle( state, type, content )
	} );
};

export default connect( mapStateToProps )( localize( TitleFormatEditor ) );
