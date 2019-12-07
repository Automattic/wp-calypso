/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

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
