import React, { Component, PropTypes } from 'react';
import {
	compact,
	flowRight as compose,
	get,
	has,
	head,
	invert,
	map,
	mapValues,
	matchesProperty,
	reduce,
	some,
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

/**
 * Converts from ContentState to native Calypso format list
 *
 * @param {ContentState} rawContent Content of editor
 * @returns {Array} title format
 */
const fromEditor = rawContent => {
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

	// add final remaining text not captured by any entity ranges
	return compact( [
		...o,
		i < t.length && { type: 'string', value: t.slice( i ) }
	] );
};

const or = ( ...args ) => some( args );

const isTextPiece = matchesProperty( 'type', 'string' );

/**
 * Creates a dictionary for building an entityMap from a given title format
 *
 * There should only be a single entity for each given type of token
 * available in the editor, and only one for each in the given title
 * formats. Therefore, we need to build this dictionary, or mapping,
 * in order to use later when actually creating the entityMap
 *
 * E.g.
 *     From: [
 *         { type: 'string', value: 'Visit ' },
 *         { type: 'siteName' },
 *         { type: 'string', value: ' | ' },
 *         { type: 'tagline' }
 *     ]
 *     To:   { siteName: 0, tagline: 1 }
 *
 * @param {object} format native title format object
 * @returns {object} mapping from token name to presumptive entity id
 */
const buildEntityMapping = compose(
	head, // return only the mapping and discard the lastKey
	format => reduce( format, ( [ entityMap, lastKey ], { type } ) => (
		or( isTextPiece( { type } ), has( entityMap, type ) ) // skip strings and existing tokens
			? [ entityMap, lastKey ]
			: [ { ...entityMap, [ type ]: lastKey }, lastKey + 1 ]
	), [ {}, 0 ] )
);

const emptyBlockMap = {
	text: '',
	entityRanges: [],
	type: 'unstyled'
};

const tokenTitle = ( type, tokens ) => get( tokens, type, '' );

/**
 * Creates a new entity reference for a blockMap
 *
 * @param {Number} offset offset of entity into block text
 * @param {String} type token name for entity reference
 * @param {object} tokens mapping between token names and translated titles
 * @param {object} entityGuide mapping between token names and entity key
 * @returns {object} entityRange for use in blockMap in ContentState
 */
const newEntityAt = ( offset, type, tokens, entityGuide ) => ( {
	key: entityGuide[ type ],
	length: tokenTitle( type, tokens ).length,
	offset
} );

/**
 * Converts native format object to block map
 *
 * E.g.
 *     From: [
 *         { type: 'siteName' },
 *         { type: 'string', value: ' | ' },
 *         { type: 'tagline' }
 *     ]
 *     To: {
 *         text: 'siteName | tagline',
 *         entityRanges: [
 *             { key: 0, offset: 0, length: 8 },
 *             { key: 1, offset: 11, length: 7 }
 *         ]
 *     }
 *
 * @param {Array} format native Calypso title format object
 * @param {object} tokens mapping between token names and translated titles
 * @param {object} entityGuide mapping between token names and entity key
 * @returns {object} blockMap for use in ContentState
 */
const buildBlockMap = compose(
	head,
	( format, tokens, entityGuide ) => reduce( format, ( [ block, lastIndex ], piece ) => [
		{
			...block,
			entityRanges: isTextPiece( piece )
				? block.entityRanges
				: [ ...block.entityRanges, newEntityAt( lastIndex, piece.type, tokens, entityGuide ) ],
			text: block.text + ( isTextPiece( piece ) ? piece.value : tokenTitle( piece.type, tokens ) ),
		},
		lastIndex + ( piece.value ? piece.value.length : tokenTitle( piece.type, tokens ).length )
	], [ emptyBlockMap, 0 ] )
);

/**
 * Converts Calypso-native title format into RawDraftContentState for Editor
 *
 * @param {Array} format pieces used to build title format
 * @param {object} tokens mapping between token names and translated titles
 * @returns {RawDraftContentState} content for editor
 */
const toEditor = ( format, tokens ) => {
	const entityGuide = buildEntityMapping( format );
	const blocks = [ buildBlockMap( format, tokens, entityGuide ) ];

	return {
		blocks,
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
				convertFromRaw( toEditor( props.titleFormats, props.tokens ) ),
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

		// Create a new EditorState entirely, because we
		// don't want to allow things like "undo" which
		// would revert to the previous title type's format
		this.setState( {
			editorState: EditorState.createWithContent(
				convertFromRaw( toEditor( props.titleFormats, props.tokens ) ),
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
				onChange( fromEditor( convertToRaw( currentContent ) ) );
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
	tokens: PropTypes.object.isRequired
};

export default TitleFormatEditor;
