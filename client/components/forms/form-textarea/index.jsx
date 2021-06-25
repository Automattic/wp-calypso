/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const FormTextarea = ( { className, isError, isValid, children, forwardedRef, ...otherProps } ) => (
	<textarea
		{ ...otherProps }
		className={ classnames( className, 'form-textarea', {
			'is-error': isError,
			'is-valid': isValid,
		} ) }
		ref={ forwardedRef }
	>
		{ children }
	</textarea>
);

export default FormTextarea;
