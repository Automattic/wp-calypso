/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { keys, omit, noop } from 'lodash';

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

	constructor() {
		super();
		this.state = {
			focused: false,
			value: null,
		};
	}

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
		if ( e.which === 13 && this.getValue() !== '' ) {
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
		this.props.onAction( this.getValue(), e );
	};

	getValue() {
		if ( this.state.value === null ) {
			return this.props.defaultValue;
		}
		return this.state.value;
	}

	render() {
		return (
			<div
				className={ classNames( 'form-text-input-with-action', {
					'is-focused': this.state.focused,
					'is-disabled': this.props.disabled,
					'is-error': this.props.isError,
					'is-valid': this.props.isValid,
				} ) }
				role="group"
			>
				<FormTextInput
					className="form-text-input-with-action__input"
					ref={ this.props.inputRef }
					disabled={ this.props.disabled }
					defaultValue={ this.props.defaultValue }
					onChange={ this.handleChange }
					onFocus={ this.handleFocus }
					onBlur={ this.handleBlur }
					onKeyDown={ this.handleKeyDown }
					{ ...omit( this.props, keys( this.constructor.propTypes ) ) }
				/>
				<FormButton
					className="form-text-input-with-action__button is-compact"
					disabled={ this.props.disabled || this.getValue() === '' }
					onClick={ this.handleAction }
				>
					{ this.props.action }
				</FormButton>
			</div>
		);
	}
}
