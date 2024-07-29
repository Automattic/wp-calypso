import { Button } from '@wordpress/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

const noop = () => {};

function FormTextInputWithAction( {
	className,
	clearOnSubmit = false,
	action,
	inputRef,
	onFocus = noop,
	onBlur = noop,
	onKeyDown = noop,
	onChange = noop,
	onAction = noop,
	defaultValue = '',
	disabled,
	isError,
	isValid,
	...props
} ) {
	const [ focused, setFocused ] = useState( false );
	const [ value, setValue ] = useState( defaultValue );

	const handleFocus = useCallback(
		( e ) => {
			setFocused( true );
			onFocus( e );
		},
		[ onFocus ]
	);

	const handleBlur = useCallback(
		( e ) => {
			setFocused( false );
			onBlur( e );
		},
		[ onBlur ]
	);

	const handleChange = useCallback(
		( e ) => {
			setValue( e.target.value );
			onChange( e.target.value, e );
		},
		[ onChange ]
	);

	const handleAction = useCallback(
		( e ) => {
			onAction( value, e );
			if ( clearOnSubmit ) {
				setValue( '' );
			}
		},
		[ clearOnSubmit, onAction, value ]
	);

	const handleKeyDown = useCallback(
		( e ) => {
			onKeyDown( e );
			if ( e.which === 13 && value ) {
				handleAction( e );
			}
		},
		[ handleAction, onKeyDown, value ]
	);

	return (
		<div
			className={ clsx( 'form-text-input-with-action', className, {
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
				onChange={ handleChange }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				onKeyDown={ handleKeyDown }
			/>
			<Button
				size="compact"
				className="form-text-input-with-action__button"
				disabled={ disabled || ! value }
				onClick={ handleAction }
			>
				{ action }
			</Button>
		</div>
	);
}

FormTextInputWithAction.propTypes = {
	className: PropTypes.string,
	clearOnSubmit: PropTypes.bool,
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

export default FormTextInputWithAction;
