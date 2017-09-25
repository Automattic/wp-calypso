/**
 * External dependencies
 */
import classNames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class FormTextInput extends PureComponent {
	static propTypes = {
		isError: PropTypes.bool,
		isValid: PropTypes.bool,
		selectOnFocus: PropTypes.bool,
		className: PropTypes.string,
	};

	constructor() {
		super( ...arguments );

		this.selectOnFocus = this.selectOnFocus.bind( this );
	}

	focus() {
		this.refs.textField.focus();
	}

	selectOnFocus( event ) {
		if ( this.props.selectOnFocus ) {
			event.target.select();
		}
	}

	render() {
		const { inputRef } = this.props;
		const props = omit( this.props, 'isError', 'isValid', 'selectOnFocus', 'inputRef' );

		const classes = classNames( 'form-text-input', this.props.className, {
			'is-error': this.props.isError,
			'is-valid': this.props.isValid,
		} );

		return (
			<input
				type="text"
				{ ...props }
				ref={ inputRef || 'textField' }
				className={ classes }
				onClick={ this.selectOnFocus }
			/>
		);
	}
}
