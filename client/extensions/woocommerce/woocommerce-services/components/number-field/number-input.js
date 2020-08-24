/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

export default class NumberInput extends Component {
	static propTypes = {
		onChange: PropTypes.func,
	};

	static defaultProps = {
		onChange: () => {},
	};

	state = {
		focused: false,
		text: this.props.value,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! this.state.focused && nextProps.value !== this.props.value ) {
			this.setState( { text: nextProps.value } );
		}
	}

	handleChange = ( event ) => {
		this.setState( { text: event.target.value } );
		this.props.onChange( event );
	};

	handleBlur = ( event ) => {
		this.setState( {
			focused: false,
			text: this.props.value,
		} );
		this.props.onChange( event );
	};

	handleFocus = () => {
		this.setState( { focused: true } );
	};

	render() {
		return (
			<FormTextInput
				{ ...this.props }
				value={ this.state.text }
				onChange={ this.handleChange }
				onBlur={ this.handleBlur }
				onFocus={ this.handleFocus }
			/>
		);
	}
}
