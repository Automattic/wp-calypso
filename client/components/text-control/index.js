import { FormLabel } from '@automattic/components';
import { withFocusOutside } from '@wordpress/components';
import clsx from 'clsx';
import { Component } from 'react';

/*
 * This component is temporary until we can pull in `@wordpress/components` and merge https://github.com/Automattic/wp-calypso/pull/34277.
 * See https://github.com/Automattic/wp-calypso/pull/34380.
 */

class MurielTextControl extends Component {
	state = {
		isFocused: false,
	};

	handleFocusOutside() {
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

		const classes = clsx(
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
					{ label && <FormLabel className="text-control__label">{ label }</FormLabel> }
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

export default withFocusOutside( MurielTextControl );
