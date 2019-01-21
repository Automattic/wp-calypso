/** @format */

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

	constructor() {
		super( ...arguments );

		this.textField = React.createRef();

		this.selectOnFocus = this.selectOnFocus.bind( this );
		this.setTextFieldRef = this.setTextFieldRef.bind( this );
	}

	setTextFieldRef( node ) {
		this.props.inputRef && this.props.inputRef( node );
		this.textField = node;
	}

	focus() {
		this.textField && this.textField.current.focus();
	}

	selectOnFocus( event ) {
		if ( this.props.selectOnFocus ) {
			event.target.select();
		}
	}

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
				ref={ this.setTextFieldRef }
				className={ classes }
				onClick={ this.selectOnFocus }
			/>
		);
	}
}
