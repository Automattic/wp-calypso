/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { omit, noop } from 'lodash';

const TokenInput = React.createClass( {
	propTypes: {
		disabled: PropTypes.bool,
		hasFocus: PropTypes.bool,
		onChange: PropTypes.func,
		onBlur: PropTypes.func,
		placeholder: PropTypes.string,
		value: PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			disabled: false,
			hasFocus: false,
			onChange: noop,
			onBlur: noop,
			placeholder: '',
			value: '',
		};
	},

	mixins: [ PureRenderMixin ],

	componentDidUpdate: function() {
		if ( this.props.hasFocus ) {
			this.textInput.focus();
		}
	},

	render: function() {
		const { placeholder, value } = this.props;
		const size =
			( ( value.length === 0 && placeholder && placeholder.length ) || value.length ) + 1;

		return (
			<input
				className="token-field__input"
				onChange={ this.onChange }
				ref={ this.setTextInput }
				size={ size }
				type="text"
				{ ...omit( this.props, [ 'hasFocus', 'onChange' ] ) }
			/>
		);
	},

	setTextInput: function( input ) {
		this.textInput = input;
	},

	onChange: function( event ) {
		this.props.onChange( {
			value: event.target.value,
		} );
	},
} );

export default TokenInput;
