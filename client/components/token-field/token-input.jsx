/**
 * External dependencies
 */
var React = require( 'react/addons' );

var TokenInput = React.createClass( {
	propTypes: {
		onChange: React.PropTypes.func,
		onBlur: React.PropTypes.func,
		value: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			onChange: function() {},
			onBlur: function() {},
			value: ''
		};
	},

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<input
				type="text"
				value={ this.props.value }
			 	size={ this.props.value.length + 1 }
				onBlur={ this.props.onBlur }
				onChange={ this._onChange }
				className="token-field__input"
			/>
		);
	},

	focus: function() {
		if ( this.isMounted() ) {
			this.getDOMNode().focus();
		}
	},

	hasFocus: function() {
		return this.isMounted() && this.getDOMNode() === document.activeElement;
	},

	_onChange: function( event ) {
		this.props.onChange( {
			value: event.target.value
		} );
	}
} );

module.exports = TokenInput;
