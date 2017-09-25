/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

const FormInputCheckbox = ( { className, ...otherProps } ) => (
	<input
		{ ...otherProps }
		type="checkbox"
		className={ classnames( className, 'form-checkbox' ) }
	/>
);

export default FormInputCheckbox;
