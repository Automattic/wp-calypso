import React, { Component, PropTypes } from 'react';
import {
	compact,
	get,
	has,
	invert,
	mapValues,
} from 'lodash';
import {
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
	convertFromRaw,
	convertToRaw,
} from 'draft-js';

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

const Token = props => {
	const style = {
		borderRadius: '3px',
		backgroundColor: '#08c',
		marginLeft: '1px',
		marginRight: '1px',
		padding: '2px',
		color: '#fff'
	};

	return (
		<span style={ style }>{ props.children }</span>
	);
};

const toFormatObject = rawContent => {
	const text = get( rawContent, 'blocks[0].text', '' );
	const ranges = get( rawContent, 'blocks[0].entityRanges', [] );
	const entities = get( rawContent, 'entityMap' );

	const [ o, i, t ] = ranges.reduce( ( [ output, lastIndex, remainingText ], next ) => {
		const tokenName = get( entities, [ next.key, 'data', 'name' ], null );
		const textBlock = next.offset > lastIndex
			? { type: 'string', value: remainingText.slice( lastIndex, next.offset ) }
			: null;

		return [ [
			...output,
			textBlock,
			{ type: tokenName }
		], next.offset + next.length, remainingText ];
	}, [ [], 0, text ] );

	return compact( [
		...o,
		i < t.length && { type: 'string', value: t.slice( i ) }
	] );
};

const fromFormatObject = format => {
	const [ entityGuide, ] = format.reduce( ( [ map, lastKey ], { type, value } ) => {
		if ( value ) {
			return [ map, lastKey ];
		}

		if ( has( map, type ) ) {
			return [ map, lastKey ];
		}

		return [
			{
				...map,
				[ type ]: lastKey
			},
			lastKey + 1
		];
	}, [ {}, 0 ] );

	const [ blockMap, ] = format.reduce( ( [ block, lastIndex ], { type, value } ) => {
		return [
			{
				...block,
				entityRanges: compact( [
					...block.entityRanges,
					value ? null : {
						key: entityGuide[ type ],
						offset: lastIndex,
						length: type.length
					}
				] ),
				text: block.text + ( value ? value : type )
			},
			lastIndex + ( value ? value.length : type.length )
		];
	}, [ { text: '', entityRanges: [], type: 'unstyled' }, 0 ] );

	return {
		blocks: [ blockMap ],
		entityMap: mapValues( invert( entityGuide ), name => ( {
			type: 'TOKEN',
			mutability: 'IMMUTABLE',
			data: { name }
		} ) )
	};
};

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createWithContent(
				convertFromRaw( fromFormatObject( props.titleFormats ) ),
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

	componentWillReceiveProps( props ) {
		const { type: oldType } = this.props;
		const { type: newType } = props;

		// Only swap out the local changes if we
		// are switching title types, as within the
		// same type we are still editing, not
		// flipping to another
		if ( oldType === newType ) {
			return;
		}

		// Create a new EditoState entirely, because we
		// don't want to allow things like "undo" which
		// would revert to the previous title type's format
		this.setState( {
			editorState: EditorState.createWithContent(
				convertFromRaw( fromFormatObject( props.titleFormats ) ),
				new CompositeDecorator( [ {
					strategy: this.renderTokens,
					component: Token
				} ] )
			)
		} );
	}

	updateEditor( editorState ) {
		const { onChange } = this.props;
		const currentContent = editorState.getCurrentContent();

		if ( convertToRaw( currentContent ).blocks.length > 1 ) {
			return;
		}

		this.setState(
			{ editorState },
			() => {
				editorState.lastChangeType === 'add-token' && this.focusEditor();
				onChange( toFormatObject( convertToRaw( currentContent ) ) );
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
		const { tokens } = this.props;

		return (
			<div style={ editorStyle }>
				<div style={ { marginBottom: '10px' } }>
					{ tokens.map( ( { title, tokenName } ) => (
						<span
							key={ tokenName }
							style={ buttonStyle }
							onClick={ this.addToken( title, tokenName ) }
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
	tokens: PropTypes.arrayOf( PropTypes.shape( {
		title: PropTypes.string.isRequired,
		tokenName: PropTypes.string.isRequired
	} ) ).isRequired
};

export default TitleFormatEditor;
