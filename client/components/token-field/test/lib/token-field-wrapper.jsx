/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import TokenField from 'components/token-field';

import { unescapeAndFormatSpaces } from 'lib/formatting';

const suggestions = [
	'the', 'of', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it',
	'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we',
	'snake', 'pipes', 'sound'
];

const TokenFieldWrapper = React.createClass( {
	getInitialState: function() {
		return {
			tokenSuggestions: suggestions,
			tokens: Object.freeze( [ 'foo', 'bar' ] )
		};
	},

	render: function() {
		return (
			<TokenField
				suggestions={ this.state.tokenSuggestions }
				value={ this.state.tokens }
				displayTransform={ unescapeAndFormatSpaces }
				onChange={ this._onTokensChange }
				ref="tokenField" />
		);
	},

	_onTokensChange: function( value ) {
		this.setState( { tokens: value } );
	}
} );

module.exports = TokenFieldWrapper;
