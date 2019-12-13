/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const FormInputCheckbox = ( { className, ...otherProps } ) => (
	<input { ...otherProps } type="checkbox" className={ classnames( className, 'form-checkbox' ) } />
);

export default FormInputCheckbox;
