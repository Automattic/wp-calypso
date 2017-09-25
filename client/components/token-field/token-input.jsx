/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

const TokenInput = React.createClass( {
	propTypes: {
		onChange: PropTypes.func,
		onBlur: PropTypes.func,
		value: PropTypes.string,
		placeholder: PropTypes.string,
		disabled: PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			onChange: function() {},
			onBlur: function() {},
			value: '',
			disabled: false,
			placeholder: '',
		};
	},

	mixins: [ PureRenderMixin ],

	render: function() {
		const props = { ...this.props, onChange: this._onChange };
		const { value, placeholder } = props;
		const size = ( ( value.length === 0 && placeholder && placeholder.length ) || value.length ) + 1;

		return (
			<input
				ref="input"
				type="text"
				{ ...props }
				size={ size }
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
