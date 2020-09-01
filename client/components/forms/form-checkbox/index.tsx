/**
 * External dependencies
 */
import React, { FunctionComponent, InputHTMLAttributes } from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

type CheckboxProps = InputHTMLAttributes< HTMLInputElement >;

const FormInputCheckbox: FunctionComponent< CheckboxProps > = ( { className, ...otherProps } ) => (
	<input { ...otherProps } type="checkbox" className={ classnames( className, 'form-checkbox' ) } />
);

export default FormInputCheckbox;
