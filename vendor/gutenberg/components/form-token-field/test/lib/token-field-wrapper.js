/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { unescape } from 'lodash';

/**
 * Internal dependencies
 */
import TokenField from '../../';

const suggestions = [
	'the', 'of', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it',
	'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we',
	'associate', 'snake', 'pipes', 'sound',
];

function unescapeAndFormatSpaces( str ) {
	const nbsp = String.fromCharCode( 160 );
	return unescape( str ).replace( / /g, nbsp );
}

class TokenFieldWrapper extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			tokenSuggestions: suggestions,
			tokens: Object.freeze( [ 'foo', 'bar' ] ),
		};
		this.onTokensChange = this.onTokensChange.bind( this );
	}

	render() {
		return (
			<TokenField
				suggestions={ this.state.tokenSuggestions }
				value={ this.state.tokens }
				displayTransform={ unescapeAndFormatSpaces }
				onChange={ this.onTokensChange }
			/>
		);
	}

	onTokensChange( value ) {
		this.setState( { tokens: value } );
	}
}

module.exports = TokenFieldWrapper;
