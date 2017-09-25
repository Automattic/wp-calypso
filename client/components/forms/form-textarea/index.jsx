/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

const FormTextarea = ( { className, isError, isValid, children, ...otherProps } ) => (
	<textarea
		{ ...otherProps }
		className={ classnames( className, 'form-textarea', {
			'is-error': isError,
			'is-valid': isValid,
		} ) }
	>
		{ children }
	</textarea>
);

export default FormTextarea;
