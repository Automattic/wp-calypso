/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import wrapWithClickOutside from 'react-click-outside';

/*
 * This component is temporary until we can pull in `@wordpress/components` and merge https://github.com/Automattic/wp-calypso/pull/34277.
 * See https://github.com/Automattic/wp-calypso/pull/34380.
 */

class MurielTextControl extends Component {
	state = {
		isFocused: false,
	};

	handleClickOutside() {
		this.setState( { isFocused: false } );
	}

	handleOnBlur( onBlur, e ) {
		this.setState( { isFocused: false } );
		if ( 'function' === typeof onBlur ) {
			onBlur( e );
		}
	}

	handleOnClick( onClick, e ) {
		this.setState( { isFocused: true } );
		if ( 'function' === typeof onClick ) {
			onClick( e );
		}
	}

	handleOnFocus( onFocus, e ) {
		this.setState( { isFocused: true } );
		if ( 'function' === typeof onFocus ) {
			onFocus( e );
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
		const { className, onClick, onFocus, onBlur, onChange, help, type, ...otherProps } = this.props;
		const { label, value, disabled } = otherProps;
		const isEmpty = ! value;
		const isActive = isFocused && ! disabled;

		const classes = classNames(
			'woocommerce-muriel-text-control',
			className,
			this.getStatusClassName( disabled, isEmpty ),
			{
				active: isActive,
			}
		);

		const onChangeValue = ( event ) => onChange( event.target.value );
		return (
			<div className={ classes }>
				<div className="text-control__field">
					{ label && <label className="text-control__label">{ label }</label> }
					<input
						className="text-control__input"
						type={ type || 'text' }
						value={ value }
						onChange={ onChangeValue }
						placeholder={ label }
						onClick={ ( e ) => this.handleOnClick( onClick, e ) }
						onFocus={ ( e ) => this.handleOnFocus( onFocus, e ) }
						onBlur={ ( e ) => this.handleOnBlur( onBlur, e ) }
						{ ...otherProps }
					/>
				</div>
			</div>
		);
	}
}

export default wrapWithClickOutside( MurielTextControl );
