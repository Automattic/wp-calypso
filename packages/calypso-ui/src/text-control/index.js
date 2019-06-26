/**
 * External dependencies
 */
import React, { Component } from 'react';
import { TextControl as BaseComponent, withFocusOutside } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class TextControl extends Component {
	state = {
		isFocused: false,
	};

	handleFocusOutside() {
		this.setState( { isFocused: false } );
	}

	handleOnClick( onClick ) {
		this.setState( { isFocused: true } );
		if ( 'function' === typeof onClick ) {
			onClick();
		}
	}

	handleOnFocus( onFocus ) {
		this.setState( { isFocused: true } );
		if ( 'function' === typeof onFocus ) {
			onFocus();
		}
	}

	getStatusClassName( disabled, isEmpty ) {
		let className = 'with-value';
		if ( isEmpty ) {
			className = 'empty';
		} else if ( disabled ) {
			className = 'disabled';
		}

		return className;
	}

	render() {
		const { isFocused } = this.state;
		const { className, onClick, onFocus, ...otherProps } = this.props;
		const { label, value, disabled } = otherProps;
		const isEmpty = ! value;
		const isActive = isFocused && ! disabled;

		const classes = classNames(
			'muriel-component',
			'muriel-input-text',
			className,
			this.getStatusClassName( disabled, isEmpty ),
			{
				active: isActive,
			}
		);

		return (
			<BaseComponent
				className={ classes }
				placeholder={ label }
				onClick={ () => this.handleOnClick( onClick ) }
				onFocus={ () => this.handleOnFocus( onFocus ) }
				{ ...otherProps }
			/>
		);
	}
}

export default withFocusOutside( TextControl );
