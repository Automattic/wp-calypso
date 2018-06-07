/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import 'components/title-format-editor/draft-js-polyfills';
// draft-js needs to be loaded *after* the polyfills
import { CompositeDecorator, Editor, EditorState, Modifier, ContentState } from 'draft-js';
import { extractTokensFromString, computeTokenUsage } from './utils.js';

const TRANSLATION_TOKEN_REGEX = /(%(\d+\$(?:\d+)?)?[bcdefgosuxEFGX]|%\([^)]+\)[sd]|%%|{{[^}]+}})/g;
function translationTokenStrategy( contentBlock, callback ) {
	const text = contentBlock.getText();
	let matchArr, start;
	while ( ( matchArr = TRANSLATION_TOKEN_REGEX.exec( text ) ) !== null ) {
		start = matchArr.index;
		callback( start, start + matchArr[ 0 ].length );
	}
}

const TranslationToken = props => {
	return (
		<span className="community-translator__inline-token" data-offset-key={ props.offsetKey }>
			{ props.children }
		</span>
	);
};

const OriginalString = props => {
	const tokens = extractTokensFromString( props.value );
	if ( tokens.length === 0 ) {
		return <dfn>{ props.value }</dfn>;
	}
	const result = [];
	let cursor = 0;
	tokens.forEach( ( { offset, length, value } ) => {
		if ( cursor < offset ) {
			result.push(
				<span key={ 'string' + cursor }>{ props.value.substr( cursor, offset - cursor ) }</span>
			);
		}
		result.push(
			<span
				key={ 'token' + offset }
				className="community-translator__inline-token"
				onClick={ () => props.onTokenClick( value ) }
			>
				{ value }
			</span>
		);
		cursor = offset + length;
	} );
	if ( cursor < props.value.length ) {
		result.push( <span key={ 'string' + cursor }>{ props.value.substr( cursor ) }</span> );
	}
	return <dfn>{ result }</dfn>;
};

class TranslatableTextarea extends React.Component {
	constructor( props ) {
		super( props );
		const compositeDecorator = new CompositeDecorator( [
			{
				strategy: translationTokenStrategy,
				component: TranslationToken,
			},
		] );
		const val = props.initialValue || '';
		const availableTokens = extractTokensFromString( this.props.originalString );
		this.state = {
			editorState: EditorState.createWithContent(
				ContentState.createFromText( val ),
				compositeDecorator
			),
			availableTokens,
			tokensWithUsage: computeTokenUsage( val, availableTokens ),
		};
		this.focus = () => this.editorRef && this.editorRef.focus();
		this.onChange = ( editorState, callback ) => {
			const plainText = editorState.getCurrentContent().getPlainText();
			this.setState(
				{
					editorState,
					tokensWithUsage: computeTokenUsage( plainText, this.state.availableTokens ),
				},
				callback
			);
			this.props.onChange( this.props.fieldName, plainText );
		};
	}
	append = str => {
		const originalState = this.state.editorState;
		const selection = originalState.getSelection();
		const contentState = originalState.getCurrentContent();
		const ncs = Modifier.replaceText( contentState, selection, str );
		const editorState = EditorState.push( originalState, ncs, 'insert-fragment' );
		this.onChange( editorState, this.focus );
	};
	render() {
		const { originalString, title, disabled } = this.props;
		return (
			<span className="community-translator__string-container">
				<span className="community-translator__string-description">{ title }</span>
				<div className="community-translator__translation-area">
					<OriginalString value={ originalString } onTokenClick={ this.append } />
					<div className="community-translator__editor">
						<div className="community-translator__input" onClick={ this.focus }>
							<Editor
								disabled={ disabled }
								editorState={ this.state.editorState }
								onChange={ this.onChange }
								ref={ ref => ( this.editorRef = ref ) }
								spellCheck={ true }
							/>
						</div>
						{ this.state.tokensWithUsage.length > 0 && (
							<div className="community-translator__suggestion-panel">
								{ 'Click to insert: ' }
								{ this.state.tokensWithUsage.map( ( token, i ) => (
									<span
										className="community-translator__token"
										key={ i + token.value }
										disabled={ token.used }
										onClick={ () => this.append( token.value ) }
									>
										<span>{ token.value }</span>
									</span>
								) ) }
							</div>
						) }
					</div>
				</div>
			</span>
		);
	}
}

export default TranslatableTextarea;
