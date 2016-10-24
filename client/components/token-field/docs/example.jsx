/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var TokenField = require( 'components/token-field' ),
	Card = require( 'components/card' );

/**
 * Module variables
 */
var suggestions = [
	'the', 'of', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it',
	'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we',
	'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search', 'free', 'but', 'our', 'one',
	'other', 'do', 'no', 'information', 'time', 'they', 'site', 'he', 'up', 'may', 'what', 'which', 'their'
];

var TokenFields = React.createClass( {
	displayName: 'TokenFields',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			tokenSuggestions: suggestions,
			tokens: Object.freeze( [ 'foo', 'bar' ] ),
			disabledTokens: [ 'foo', 'bar' ],
			statusTokens: Object.freeze( [ 'success', 'error', 'validating', 'none' ] )
		};
	},

	render: function() {
		return (
			<div>
				<p>
					The <code>TokenField</code> is a field similar to the tags and categories
					fields in the interim editor chrome, or the "to" field in Mail on OS X.
					Tokens can be entered by typing them or selecting them from a list of suggested tokens.
				</p>

				<Card>
					<h3>Default TokenField with Suggestions</h3>
					<TokenField
						isBorderless={ this.state.isBorderless }
						suggestions={ this.state.tokenSuggestions }
						value={ this.state.tokens }
						onChange={ this._onTokensChange } />
				</Card>

				<Card>
					<h3>Borderless Tokens with Statuses</h3>
					<TokenField
						isBorderless
						value={ this._getStatusTokens() }
						onChange={ this._onStatusTokensChange } />
				</Card>

				<Card>
					<h3>Borderless and Disabled TokenField</h3>
					<TokenField
						disabled
						isBorderless
						value={ this.state.disabledTokens } />
				</Card>
			</div>
		);
	},

	_getStatusTokens() {
		return this.state.statusTokens.map( ( token ) => {
			let returnToken;
			switch ( token ) {
				case 'error':
				case 'validating':
				case 'success':
					returnToken = {
						value: token,
						status: token
					};
					break;
				default:
					returnToken = token;
					break;
			}

			return returnToken;
		} );
	},

	_onStatusTokensChange( value ) {
		const filteredTokens = value.map( ( token ) => {
			if ( 'object' === typeof token ) {
				return token.value;
			}
			return token;
		} );

		this.setState( { statusTokens: filteredTokens } );
	},

	_onTokensChange: function( value ) {
		this.setState( { tokens: value } );
	}
} );

module.exports = TokenFields;
