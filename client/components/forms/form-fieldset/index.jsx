/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const FormFieldset = ( { className, children, ...otherProps } ) => (
	<fieldset { ...otherProps } className={ classnames( className, 'form-fieldset' ) }>
		{ children }
	</fieldset>
);

export default FormFieldset;
