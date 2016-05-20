/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var ClipboardButton = require( '../' ),
	DocsExample = require( 'components/docs-example' );

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
			<DocsExample
				title="Clipboard Buttons"
				url="/devdocs/design/clipboard-buttons"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<ClipboardButton
					onCopy={ this.onCopy }
					text="This text was copied via ClipboardButton"
					style={ { float: 'none' } }>
					{ this.state.isCopied ? 'Copied!' : 'Copy to clipboard' }
				</ClipboardButton>
			</DocsExample>
		);
	}
} );
