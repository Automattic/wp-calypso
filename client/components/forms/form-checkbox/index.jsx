/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const FormInputCheckbox = ( { className, ...otherProps } ) => (
	<input { ...otherProps } type="checkbox" className={ classnames( className, 'form-checkbox' ) } />
);

export default FormInputCheckbox;
