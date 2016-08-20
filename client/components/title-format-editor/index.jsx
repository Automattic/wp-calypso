import React, { Component, PropTypes } from 'react';
import {
	compact,
	flowRight as compose,
	find,
	get,
	has,
	head,
	invert,
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

const toCalypso = rawContent => {
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
	format => reduce( format, ( [ map, lastKey ], { type } ) => (
		or( isTextPiece( { type } ), has( map, type ) ) // skip strings and existing tokens
			? [ map, lastKey ]
			: [ { ...map, [ type ]: lastKey }, lastKey + 1 ]
	), [ {}, 0 ] )
);

const emptyBlockMap = {
	text: '',
	entityRanges: [],
	type: 'unstyled'
};

const getTokenTitle = ( type, tokens ) => get(
	find( tokens, matchesProperty( 'tokenName', type ) ),
	'title',
	''
);

const addPieceToBlock = ( block, offset, { type, value }, tokens, entityGuide ) => ( {
	...block,
	entityRanges: compact( [
		...block.entityRanges,
		value ? null : {
			key: entityGuide[ type ],
			length: getTokenTitle( type, tokens ).length,
			offset,
		},
	] ),
	text: block.text + ( value ? value : getTokenTitle( type, tokens ) ),
} );

const buildBlockMap = compose(
	head,
	( format, tokens, entityGuide ) => reduce( format, ( [ block, lastIndex ], piece ) => [
		addPieceToBlock( block, lastIndex, piece, tokens, entityGuide ),
		lastIndex + ( piece.value ? piece.value.length : getTokenTitle( piece.type, tokens ).length )
	], [ emptyBlockMap, 0 ] )
);

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
				onChange( toCalypso( convertToRaw( currentContent ) ) );
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
