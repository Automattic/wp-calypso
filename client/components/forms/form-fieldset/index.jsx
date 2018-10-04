/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

const FormFieldset = ( { className, children, ...otherProps } ) => (
	<fieldset { ...otherProps } className={ classnames( className, 'form-fieldset' ) }>
		{ children }
	</fieldset>
);

export default FormFieldset;
