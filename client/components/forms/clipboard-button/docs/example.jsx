/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var ClipboardButton = require( '../' );

module.exports = React.createClass( {
	displayName: 'ClipboardButtons',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			isCopied: false
		};
	},

	onCopy: function() {
		this.setState( {
			isCopied: true
		} );
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/clipboard-buttons">Clipboard Buttons</a>
				</h2>
				<ClipboardButton
					onCopy={ this.onCopy }
					text="This text was copied via ClipboardButton"
					style={ { float: 'none' } }>
					{ this.state.isCopied ? 'Copied!' : 'Copy to clipboard' }
				</ClipboardButton>
			</div>
		);
	}
} );
