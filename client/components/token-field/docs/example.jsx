/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var TokenField = require( 'components/token-field' );

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

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {
			tokenSuggestions: suggestions,
			tokens: Object.freeze( [ 'foo', 'bar' ] )
		};
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/token-fields">Token Field</a>
				</h2>
				<TokenField
					suggestions={ this.state.tokenSuggestions }
					value={ this.state.tokens }
					onChange={ this._onTokensChange } />
			</div>
		);
	},

	_onTokensChange: function( value ) {
		this.setState( { tokens: value } );
	}
} );

module.exports = TokenFields;
