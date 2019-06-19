/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { TextControl as BaseComponent, withFocusOutside } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class TextControl extends PureComponent {
	constructor( props ) {
		super( props );
		this.state = {
			isFocused: false,
		};
	}

	/**
	 * A `withFocusOutside`'s default function, handler for the focus outside the component event.
	 */
	handleFocusOutside() {
		this.setState( { isFocused: false } );
	}

	handleOnClick( onClick ) {
		this.setState( { isFocused: true } );
		if ( typeof onClick === 'function' ) {
			onClick();
		}
	}

	getClassName( disabled, isEmpty, isActive ) {
		let className = 'with-value';
		if ( disabled ) {
			className = 'disabled';
		} else if ( isEmpty ) {
			className = 'empty';
		} else if ( isActive ) {
			className = 'active';
		}

		return className;
	}

	render() {
		const { isFocused } = this.state;
		const { className, onClick, ...otherProps } = this.props;
		const { label, value, disabled } = otherProps;
		const isEmpty = ! value;
		const isActive = isFocused && ! disabled;

		const classes = classNames(
			'muriel-component',
			'muriel-input-text',
			className,
			this.getClassName( disabled, isEmpty, isActive )
		);

		return (
			<BaseComponent
				className={ classes }
				placeholder={ label }
				onClick={ () => this.handleOnClick( onClick ) }
				{ ...otherProps }
			/>
		);
	}
}

export default withFocusOutside( TextControl );
