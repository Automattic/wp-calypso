/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { omit } from 'lodash';

export default class FormTextInput extends PureComponent {
	static propTypes = {
		isError: PropTypes.bool,
		isValid: PropTypes.bool,
		selectOnFocus: PropTypes.bool,
		className: PropTypes.string,
	};

	currentTextField = undefined;

	textFieldRef = ( element ) => {
		this.currentTextField = element;

		const { inputRef } = this.props;

		if ( ! inputRef ) {
			return;
		}

		if ( typeof inputRef === 'function' ) {
			inputRef( element );
		} else {
			inputRef.current = element;
		}
	};

	focus() {
		if ( this.currentTextField ) {
			this.currentTextField.focus();
		}
	}

	selectOnFocus = ( event ) => {
		if ( this.props.selectOnFocus ) {
			event.target.select();
		}
	};

	render() {
		const props = omit( this.props, 'isError', 'isValid', 'selectOnFocus', 'inputRef' );

		const classes = classNames( 'form-text-input', this.props.className, {
			'is-error': this.props.isError,
			'is-valid': this.props.isValid,
		} );

		return (
			<input
				type="text"
				{ ...props }
				ref={ this.textFieldRef }
				className={ classes }
				onClick={ this.selectOnFocus }
			/>
		);
	}
}
