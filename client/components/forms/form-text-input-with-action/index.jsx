/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { keys, omit, noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';

export default React.createClass( {
	displayName: 'FormTextInputWithAction',

	propTypes: {
		action: React.PropTypes.node,
		inputRef: React.PropTypes.func,
		onFocus: React.PropTypes.func,
		onBlur: React.PropTypes.func,
		onKeyDown: React.PropTypes.func,
		onChange: React.PropTypes.func,
		onAction: React.PropTypes.func,
		defaultValue: React.PropTypes.string,
		disabled: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			defaultValue: '',
			onFocus: noop,
			onBlur: noop,
			onKeyDown: noop,
			onChange: noop,
			onAction: noop,
		};
	},

	getInitialState() {
		return {
			focused: false,
			value: null,
		};
	},

	handleFocus( e ) {
		this.props.onFocus( e );
		if ( e.defaultPrevented ) {
			return;
		}
		this.setState( {
			focused: true,
		} );
	},

	handleBlur( e ) {
		this.props.onBlur( e );
		if ( e.defaultPrevented ) {
			return;
		}
		this.setState( {
			focused: false,
		} );
	},

	handleKeyDown( e ) {
		this.props.onKeyDown( e );
		if ( e.defaultPrevented ) {
			return;
		}
		if ( e.which === 13 && this.getValue() !== '' ) {
			this.props.onAction( e );
		}
	},

	handleChange( e ) {
		this.props.onChange( e );
		if ( e.defaultPrevented ) {
			return;
		}
		this.setState( {
			value: e.target.value,
		} );
	},

	getValue() {
		if ( this.state.value === null ) {
			return this.props.defaultValue;
		}
		return this.state.value;
	},

	render() {
		return (
			<div
				className={ classNames( 'form-text-input-with-action', {
					'is-focused': this.state.focused,
					'is-disabled': this.props.disabled
				} ) }
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
					onClick={ this.props.onAction }
				>
					{ this.props.action }
				</FormButton>
			</div>
		);
	}
} );
