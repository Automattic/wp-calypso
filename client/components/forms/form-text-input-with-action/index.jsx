/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';

/**
 * Style dependencies
 */
import './style.scss';

export default class FormTextInputWithAction extends Component {
	static propTypes = {
		className: PropTypes.string,
		action: PropTypes.node,
		inputRef: PropTypes.func,
		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		onKeyDown: PropTypes.func,
		onChange: PropTypes.func,
		onAction: PropTypes.func,
		defaultValue: PropTypes.string,
		disabled: PropTypes.bool,
		isError: PropTypes.bool,
		isValid: PropTypes.bool,
	};

	static defaultProps = {
		defaultValue: '',
		onFocus: noop,
		onBlur: noop,
		onKeyDown: noop,
		onChange: noop,
		onAction: noop,
		isError: false,
		isValid: false,
	};

	state = {
		focused: false,
		value: String( this.props.defaultValue ),
	};

	handleFocus = e => {
		this.setState( {
			focused: true,
		} );

		this.props.onFocus( e );
	};

	handleBlur = e => {
		this.setState( {
			focused: false,
		} );

		this.props.onBlur( e );
	};

	handleKeyDown = e => {
		this.props.onKeyDown( e );
		if ( e.which === 13 && this.state.value ) {
			this.handleAction( e );
		}
	};

	handleChange = e => {
		this.setState( {
			value: e.target.value,
		} );

		this.props.onChange( e.target.value, e );
	};

	handleAction = e => {
		this.props.onAction( this.state.value, e );
	};

	render() {
		const {
			className,
			action,
			inputRef,
			onFocus,
			onBlur,
			onKeyDown,
			onChange,
			onAction,
			defaultValue,
			disabled,
			isError,
			isValid,
			...props
		} = this.props;
		const { focused, value } = this.state;

		return (
			<div
				className={ classNames( 'form-text-input-with-action', className, {
					'is-focused': focused,
					'is-disabled': disabled,
					'is-error': isError,
					'is-valid': isValid,
				} ) }
				role="group"
			>
				<FormTextInput
					{ ...props }
					className="form-text-input-with-action__input"
					ref={ inputRef }
					disabled={ disabled }
					value={ value }
					defaultValue={ defaultValue }
					onChange={ this.handleChange }
					onFocus={ this.handleFocus }
					onBlur={ this.handleBlur }
					onKeyDown={ this.handleKeyDown }
				/>
				<FormButton
					className="form-text-input-with-action__button is-compact"
					disabled={ disabled || ! value }
					onClick={ this.handleAction }
				>
					{ action }
				</FormButton>
			</div>
		);
	}
}
