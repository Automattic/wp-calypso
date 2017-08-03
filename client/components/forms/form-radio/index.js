/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const FormRadio = ( { className, ...otherProps } ) => (
	<input { ...otherProps }
		type="radio"
		className={ classnames( className, 'form-radio' ) }
	/>
);

export default FormRadio;
