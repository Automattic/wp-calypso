/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { omit, noop } from 'lodash';

class TokenInput extends React.PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
		hasFocus: PropTypes.bool,
		onChange: PropTypes.func,
		onBlur: PropTypes.func,
		placeholder: PropTypes.string,
		value: PropTypes.string,
	};

	static defaultProps = {
		disabled: false,
		hasFocus: false,
		onChange: noop,
		onBlur: noop,
		placeholder: '',
		value: '',
	};

	componentDidUpdate() {
		if ( this.props.hasFocus ) {
			this.textInput.focus();
		}
	}

	render() {
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
	}

	setTextInput = ( input ) => {
		this.textInput = input;
	};

	onChange = ( event ) => {
		this.props.onChange( {
			value: event.target.value,
		} );
	};
}

export default TokenInput;
