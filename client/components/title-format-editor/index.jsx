import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
	map,
	max,
	min
} from 'lodash';

// The following polyfills exist for the draft-js editor, since
// we are unable to change its codebase and yet we are waiting
// on a solid solution for general IE polyfills
//
// They were borrowed and modified from MDN

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if ( ! String.prototype.endsWith ) {
	String.prototype.endsWith = function( searchString, position ) {
		const subjectString = this.toString();
		if (
			( typeof position !== 'number' ) ||
			( ! isFinite( position ) ) ||
			( Math.floor( position ) !== position ) ||
			( position > subjectString.length )
		) {
			position = subjectString.length;
		}
		position -= searchString.length;
		const lastIndex = subjectString.indexOf( searchString, position );
		return lastIndex !== -1 && lastIndex === position;
	};
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if ( ! String.prototype.startsWith ) {
	String.prototype.startsWith = function( searchString, position ) {
		position = position || 0;
		return this.substr( position, searchString.length ) === searchString;
	};
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
if ( ! Array.prototype.fill ) {
	Array.prototype.fill = function( value ) {

		// Steps 1-2.
		if ( this === null ) {
			throw new TypeError( 'this is null or not defined' );
		}

		const O = Object( this );

		// Steps 3-5.
		const len = O.length >>> 0;

		// Steps 6-7.
		const start = arguments[ 1 ];
		const relativeStart = start >> 0;

		// Step 8.
		let k = relativeStart < 0
			? Math.max( len + relativeStart, 0 )
			: Math.min( relativeStart, len );

		// Steps 9-10.
		const end = arguments[ 2 ];
		const relativeEnd = end === undefined
			? len
			: end >> 0;

		// Step 11.
		const final = relativeEnd < 0
			? Math.max( len + relativeEnd, 0 )
			: Math.min( relativeEnd, len );

		// Step 12.
		while ( k < final ) {
			O[ k ] = value;
			k++;
		}

		// Step 13.
		return O;
	};
}

// The below is a `require()` statement becuase it needs to
// be loaded in after the polyfills are created.
const {
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
	SelectionState,
} = require( 'draft-js' );

import Token from './token';
import { fromEditor, toEditor } from './parser';
import { buildSeoTitle } from 'state/sites/selectors';
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
		this.editorStateFrom = this.editorStateFrom.bind( this );

		this.state = {
			editorState: this.editorStateFrom( props ),
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.disabled && ! nextProps.disabled ) {
			this.setState( {
				editorState: this.editorStateFrom( nextProps )
			} );
		}
	}

	editorStateFrom( props ) {
		return EditorState.createWithContent(
			toEditor( props.titleFormats, props.tokens ),
			new CompositeDecorator( [ {
				strategy: this.renderTokens,
				component: Chip( this.removeToken )
			} ] )
		);
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
		const {
			titleData,
			translate,
			tokens,
			type
		} = this.props;

		const previewText = type.value
			? buildSeoTitle( { [ type.value ]: fromEditor( editorState.getCurrentContent() ) }, type.value, titleData )
			: '';

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
	const { translate } = ownProps;

	// Add example content for post/page title, tag name and archive dates
	return ( {
		titleData: {
			site,
			post: { title: translate( 'Example Title' ) },
			tag: translate( 'Example Tag' ),
			date: translate( 'August 2016' )
		}
	} );
};

export default localize( connect( mapStateToProps )( TitleFormatEditor ) );
