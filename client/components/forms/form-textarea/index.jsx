/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

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
