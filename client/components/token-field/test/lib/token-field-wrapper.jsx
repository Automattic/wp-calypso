/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var TokenField = require( 'components/token-field' ),
	unescapeAndFormatSpaces = require( 'lib/formatting' ).unescapeAndFormatSpaces;

var suggestions = [
	'the',
	'of',
	'and',
	'to',
	'a',
	'in',
	'for',
	'is',
	'on',
	'that',
	'by',
	'this',
	'with',
	'i',
	'you',
	'it',
	'not',
	'or',
	'be',
	'are',
	'from',
	'at',
	'as',
	'your',
	'all',
	'have',
	'new',
	'more',
	'an',
	'was',
	'we',
	'snake',
	'pipes',
	'sound',
];

var TokenFieldWrapper = React.createClass( {
	getInitialState: function() {
		return {
			tokenSuggestions: suggestions,
			tokens: Object.freeze( [ 'foo', 'bar' ] ),
		};
	},

	render: function() {
		return (
			<TokenField
				suggestions={ this.state.tokenSuggestions }
				value={ this.state.tokens }
				displayTransform={ unescapeAndFormatSpaces }
				onChange={ this._onTokensChange }
				ref="tokenField"
			/>
		);
	},

	_onTokensChange: function( value ) {
		this.setState( { tokens: value } );
	},
} );

module.exports = TokenFieldWrapper;
