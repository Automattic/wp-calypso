/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

var TokenInput = React.createClass( {
	propTypes: {
		onChange: React.PropTypes.func,
		onBlur: React.PropTypes.func,
		value: React.PropTypes.string,
		disabled: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			onChange: function() {},
			onBlur: function() {},
			value: '',
			disabled: false
		};
	},

	mixins: [ PureRenderMixin ],

	render: function() {
		const props = { ...this.props, onChange: this._onChange };

		return (
			<input
				ref="input"
				type="text"
				{ ...props }
				size={ this.props.value.length + 1 }
				className="token-field__input"
			/>
		);
	},

	focus: function() {
		if ( this.isMounted() ) {
			this.refs.input.focus();
		}
	},

	hasFocus: function() {
		return this.isMounted() && this.refs.input === document.activeElement;
	},

	_onChange: function( event ) {
		this.props.onChange( {
			value: event.target.value
		} );
	}
} );

export default TokenInput;
