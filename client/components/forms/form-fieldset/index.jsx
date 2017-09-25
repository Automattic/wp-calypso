/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

const FormFieldset = ( { className, children, ...otherProps } ) => (
	<fieldset { ...otherProps }
		className={ classnames( className, 'form-fieldset' ) }
	>
		{ children }
	</fieldset>
);

export default FormFieldset;
