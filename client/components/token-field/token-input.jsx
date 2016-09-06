/**
 * External dependencies
 */
var React = require( 'react' ),
	omit = require( 'lodash/omit' ),
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
		const props = omit( this.props, 'onChange' );

		return (
			<input
				ref="input"
				type="text"
				{ ...props }
				size={ this.props.value.length + 1 }
				onChange={ this._onChange }
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

module.exports = TokenInput;
