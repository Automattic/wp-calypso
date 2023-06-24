import classNames from 'classnames';
import React, { PureComponent, useRef } from 'react';

import './style.scss';

type Props = {
	isError?: boolean;
	isValid?: boolean;
	selectOnFocus?: boolean;
	inputRef?:
		| ReturnType< typeof useRef< HTMLInputElement | null > >
		| ( ( element: HTMLInputElement ) => void );
} & Partial< React.InputHTMLAttributes< HTMLInputElement > >;

export default class FormTextInput extends PureComponent< Props > {
	state = {
		value: this.props.value || '',
	};

	currentTextField: HTMLInputElement | undefined = undefined;

	componentDidUpdate( oldProps: Props ) {
		this.updateValueIfNeeded( oldProps.value );
	}

	updateValueIfNeeded( oldValue: Props[ 'value' ] ) {
		const { value } = this.props;
		if ( oldValue !== value || value !== this.state.value ) {
			this.setState( { value } );
		}
	}

	textFieldRef = ( element: HTMLInputElement ) => {
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

	selectOnFocus = ( event: React.MouseEvent< HTMLInputElement > ) => {
		if ( this.props.selectOnFocus ) {
			event.currentTarget.select();
		}
	};

	onChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		this.setState( { value: event.target.value } );
		this.props.onChange?.( event );
	};

	render() {
		const { isError, isValid, selectOnFocus, inputRef, onChange, value, ...rest } = this.props;

		const classes = classNames( 'form-text-input', this.props.className, {
			'is-error': this.props.isError,
			'is-valid': this.props.isValid,
		} );

		return (
			<input
				type="text"
				{ ...rest }
				value={ this.state.value }
				ref={ this.textFieldRef }
				className={ classes }
				onClick={ this.selectOnFocus }
				onChange={ this.onChange }
			/>
		);
	}
}
